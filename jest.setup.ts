import '@testing-library/jest-dom';

// Mock window objects that aren't available in jsdom
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock AudioContext
class MockAudioContext {
  createGain() {
    return {
      connect: jest.fn(),
      disconnect: jest.fn(),
      gain: { value: 1 },
    };
  }
  createAnalyser() {
    return {
      connect: jest.fn(),
      disconnect: jest.fn(),
      frequencyBinCount: 128,
      getByteTimeDomainData: jest.fn(),
    };
  }
  createMediaStreamSource() {
    return {
      connect: jest.fn(),
      disconnect: jest.fn(),
    };
  }
  createBufferSource() {
    return {
      connect: jest.fn(),
      disconnect: jest.fn(),
      start: jest.fn(),
      stop: jest.fn(),
      buffer: null,
    };
  }
  decodeAudioData = jest.fn().mockResolvedValue({});
  resume = jest.fn().mockResolvedValue(undefined);
  suspend = jest.fn().mockResolvedValue(undefined);
  close = jest.fn().mockResolvedValue(undefined);
  destination = {};
  state = 'running';
}

// @ts-expect-error - mocking global
global.AudioContext = MockAudioContext;

// Mock SpeechRecognition
class MockSpeechRecognition {
  continuous = false;
  interimResults = false;
  lang = 'en-US';
  maxAlternatives = 1;
  onstart = jest.fn();
  onend = jest.fn();
  onresult = jest.fn();
  onerror = jest.fn();
  onspeechstart = jest.fn();
  onspeechend = jest.fn();
  start = jest.fn();
  stop = jest.fn();
  abort = jest.fn();
}

// @ts-expect-error - mocking global
global.SpeechRecognition = MockSpeechRecognition;
// @ts-expect-error - mocking global
global.webkitSpeechRecognition = MockSpeechRecognition;

// Mock navigator.mediaDevices
Object.defineProperty(global.navigator, 'mediaDevices', {
  value: {
    getUserMedia: jest.fn().mockResolvedValue({
      getTracks: () => [{ stop: jest.fn() }],
    }),
    enumerateDevices: jest.fn().mockResolvedValue([
      { kind: 'audioinput', deviceId: 'default', label: 'Default Microphone' },
    ]),
  },
});

// Mock crypto.randomUUID
Object.defineProperty(global, 'crypto', {
  value: {
    randomUUID: () => `test-uuid-${Math.random().toString(36).substr(2, 9)}`,
  },
});

// Mock performance.now
global.performance = {
  ...global.performance,
  now: jest.fn(() => Date.now()),
};

// Mock fetch
global.fetch = jest.fn();
