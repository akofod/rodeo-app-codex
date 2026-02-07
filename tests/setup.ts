import '@testing-library/jest-dom/vitest';
import React from 'react';
import { vi } from 'vitest';

vi.mock('next/image', () => ({
  default: ({ alt, ...props }: { alt?: string }) => {
    return React.createElement('img', { alt: alt ?? '', ...props });
  },
}));

vi.mock('next/link', () => ({
  default: ({ href, children, ...props }: { href: string; children: React.ReactNode }) => {
    return React.createElement('a', { href, ...props }, children);
  },
}));

vi.mock('next/navigation', () => ({
  usePathname: () => '/',
  redirect: () => {
    throw new Error('redirect called');
  },
}));

vi.mock('next/font/google', () => ({
  Cinzel: () => ({ variable: '--font-display' }),
  Source_Sans_3: () => ({ variable: '--font-body' }),
}));

vi.mock('next/headers', () => ({
  cookies: () => ({
    get: vi.fn(),
    set: vi.fn(),
  }),
}));

vi.mock('mapbox-gl', () => {
  class MockMap {
    loaded() {
      return true;
    }
    once(_event: string, handler: () => void) {
      handler();
    }
    addControl() {}
    fitBounds() {}
    getZoom() {
      return 7;
    }
    easeTo() {}
    remove() {}
  }

  class MockMarker {
    setLngLat() {
      return this;
    }
    setPopup() {
      return this;
    }
    addTo() {
      return this;
    }
    remove() {}
  }

  class MockPopup {
    setDOMContent() {
      return this;
    }
  }

  class MockLngLatBounds {
    extend() {}
    isEmpty() {
      return false;
    }
  }

  class MockNavigationControl {}

  return {
    default: {
      Map: MockMap,
      Marker: MockMarker,
      Popup: MockPopup,
      LngLatBounds: MockLngLatBounds,
      NavigationControl: MockNavigationControl,
      accessToken: '',
    },
    Map: MockMap,
    Marker: MockMarker,
    Popup: MockPopup,
    LngLatBounds: MockLngLatBounds,
    NavigationControl: MockNavigationControl,
  };
});
