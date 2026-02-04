/**
 * Application constants and configuration
 */

// WebRTC configuration
export const WEBRTC_CONFIG = {
  // Video constraints (resolution)
  VIDEO_WIDTH: 1280,
  VIDEO_HEIGHT: 720,

  // ICE servers for NAT traversal
  ICE_SERVERS: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
  ],
} as const;

// WebSocket configuration
export const WEBSOCKET_CONFIG = {
  MAX_RECONNECT_ATTEMPTS: 5,
  BASE_RECONNECT_DELAY: 1000, // ms
  MAX_RECONNECT_DELAY: 10000, // ms
} as const;

// UI Layout constants
export const LAYOUT = {
  // Icon sizes
  ICON_SIZE_SMALL: 16,
  ICON_SIZE_MEDIUM: 18,
  ICON_SIZE_LARGE: 20,
  ICON_SIZE_XL: 24,

  // Panel dimensions
  ROOM_INFO_WIDTH: 320, // w-80
  LOCAL_VIDEO_WIDTH: 192, // w-48
  LOCAL_VIDEO_HEIGHT: 144, // h-36

  // Spacing
  SPACING_XS: 4,
  SPACING_SM: 6,
  SPACING_BASE: 16,
  SPACING_LG: 24,
} as const;

// Component-specific defaults
export const COMPONENT_DEFAULTS = {
  CHAT_MESSAGE_MAX_WIDTH: 'max-w-xs',
  ROOM_BADGE_MAX_WIDTH: 'max-w-sm',
  MODAL_MAX_WIDTH: 'max-w-sm',
} as const;

// Transitions
export const TRANSITIONS = {
  DURATION_FAST: 200,
  DURATION_BASE: 300,
  DURATION_SLOW: 500,
} as const;

// UI Delays
export const DELAYS = {
  COPY_FEEDBACK: 2000, // ms - how long to show "copied" message
  PEER_CALL_INIT: 100, // ms - delay before starting call after peer connects
  ROOM_EXIT: 300, // ms - delay before leaving room
} as const;
