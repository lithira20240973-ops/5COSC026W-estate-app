import "@testing-library/jest-dom";

// Fix for react-router / jsdom in some setups
import { TextEncoder, TextDecoder } from "util";

if (!global.TextEncoder) global.TextEncoder = TextEncoder;
if (!global.TextDecoder) global.TextDecoder = TextDecoder;