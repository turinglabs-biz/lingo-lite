# See shows the meaning: spec

Status: done

Vocabulary follows `CONTEXT.md` (see **See**, **Speak** and **Illustration**).

## Problem Statement

A See question shows only the Illustration. Many drawings are simple line art shared by a visual language (a speech bubble with a corner marker, counted dots), and on their own they are too often ambiguous: the learner can't tell which phrase is meant, so the question tests guessing rather than knowing.

## Solution

A See question shows the Expression's English meaning as a caption under the Illustration, always. The learner still picks the matching Korean from four options.

## Decision

The meaning is always shown rather than revealed on demand or replaced by a description of the drawing. The learner chose clarity over keeping See a pure picture test. As a result, See is close to Speak (English → Korean): the difference is the picture, the absence of the say-it-aloud step, and the Korean-only options.

## Testing Decisions

Presentation only; no domain behaviour changes. Checked in the running app.
