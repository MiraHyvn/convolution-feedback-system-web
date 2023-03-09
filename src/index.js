import {ConvolutionFeedbackSystem} from "./ConvolutionFeedbackSystem.js";
const S = new ConvolutionFeedbackSystem();
step();

function step() {
    S.update();
    requestAnimationFrame(step);
}
