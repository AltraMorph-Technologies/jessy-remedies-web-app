'use client';

import { App, ConfigProvider } from 'antd';
import type { PropsWithChildren } from 'react';

export function Providers({ children }: PropsWithChildren) {
  return (
    <ConfigProvider
      theme={{
        cssVar: { key: 'jesse-remedies' },
        token: {
          colorPrimary: '#173a76',
          colorText: '#101b36',
          colorTextSecondary: '#52617d',
          borderRadius: 12,
          controlHeightLG: 48,
          fontFamily: 'var(--font-manrope)',
        },
        components: {
          Slider: {
            handleColor: '#236d63',
            trackBg: '#236d63',
            trackHoverBg: '#1b594f',
          },
          Collapse: {
            headerBg: '#ffffff',
            contentBg: '#ffffff',
          },
        },
      }}
    >
      <App>{children}</App>
    </ConfigProvider>
  );
}
