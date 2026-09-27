# Converts an Echo candidate model (PyTorch weights on Hugging Face) to ONNX for the browser.
#
#   python scripts/echo-export.py <hf-repo> <revision> <out-dir>
#
# Writes model.onnx (fp32, for reference) and model_q4.onnx (4-bit weights, what the app downloads) plus
# vocab.json, and prints model_q4.onnx's size and sha256 to pin in src/echo/models.ts. Needs: torch, transformers,
# onnx, onnxruntime. The whole procedure is in the README's Echo section.
import hashlib, json, os, sys

import torch
from huggingface_hub import snapshot_download
from onnxruntime.quantization.matmul_nbits_quantizer import MatMulNBitsQuantizer
import onnx
from transformers import Wav2Vec2ForCTC

repo, revision, out = sys.argv[1], sys.argv[2], sys.argv[3]
os.makedirs(out, exist_ok=True)
src = snapshot_download(repo, revision=revision, allow_patterns=['config.json', 'preprocessor_config.json', 'vocab.json', '*.safetensors', 'pytorch_model.bin'])

model = Wav2Vec2ForCTC.from_pretrained(src).eval()
fp32 = os.path.join(out, 'model.onnx')
torch.onnx.export(
    model,
    (torch.zeros(1, 16000),),
    fp32,
    input_names=['input_values'],
    output_names=['logits'],
    dynamic_axes={'input_values': {1: 'samples'}, 'logits': {1: 'frames'}},
    opset_version=17,
    dynamo=False,
)

q = MatMulNBitsQuantizer(onnx.load(fp32), block_size=32, is_symmetric=True)
q.process()
q4 = os.path.join(out, 'model_q4.onnx')
q.model.save_model_to_file(q4, use_external_data_format=False)

vocab = json.load(open(os.path.join(src, 'vocab.json')))
json.dump(vocab, open(os.path.join(out, 'vocab.json'), 'w'), ensure_ascii=False)
sha256 = hashlib.sha256(open(q4, 'rb').read()).hexdigest()
print(f'{q4}\n  bytes: {os.path.getsize(q4)}\n  sha256: {sha256}\n  release file name: <model id>-{sha256[:8]}.onnx')
