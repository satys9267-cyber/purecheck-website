import type { Metadata } from 'next';
import { Barlow_Condensed, Inter, JetBrains_Mono } from 'next/font/google';
import './globals.css';

const barlowCondensed = Barlow_Condensed({
  subsets: ['latin'],
  weight: ['400', '600', '700', '800', '900'],
  variable: '--font-barlow',
  display: 'swap',
});

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'PURECHECK // Smart IoT Water Purity Telemetry',
  description: 'Pure Water, Pure Life: Your Health in Every Drop. Industrial-grade telemetry and real-time ESP8266 water diagnostics.',
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`dark ${barlowCondensed.variable} ${inter.variable} ${jetbrainsMono.variable}`}
    >
      <body className="bg-[#08090A] text-[#F4F5F7] font-sans antialiased selection:bg-[#E87200] selection:text-black min-h-screen overflow-x-hidden">
        
        {/* Forge Studios Architectural Grid Lines Overlay */}
        <div className="fixed inset-0 pointer-events-none z-0">
          {/* Subtle noise / texture */}
          <div className="absolute inset-0 bg-[radial-gradient(#23272F_1px,transparent_1px)] [background-size:32px_32px] opacity-40" />
          
          {/* Ambient Forge Fiery Heat Gradient in Header & Corners */}
          <div className="absolute top-0 right-1/4 w-[600px] h-[300px] bg-gradient-to-b from-[#E87200]/10 via-[#FF7A00]/5 to-transparent blur-[140px] pointer-events-none" />
          <div className="absolute bottom-10 left-10 w-[500px] h-[400px] bg-gradient-to-tr from-[#E87200]/8 to-transparent blur-[160px] pointer-events-none" />

          {/* Architectural structural vertical grid guidelines */}
          <div className="max-w-7xl mx-auto h-full px-4 sm:px-6 lg:px-8 grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-12 gap-4 border-x border-[#23272F]/40">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="border-r border-[#23272F]/20 h-full hidden lg:block" />
            ))}
          </div>
        </div>

        {/* Content Container */}
        <div className="relative z-10 min-h-screen flex flex-col">
          {children}
        </div>
      </body>
    </html>
  );
}
