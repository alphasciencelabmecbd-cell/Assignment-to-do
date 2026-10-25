import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#060913",
};

export const metadata: Metadata = {
  title: "Alpha Science Lab | Multi-Stage Competition Platform",
  description: "Official submission platform for Alpha Science Lab (ASL). Securely submit video demonstrations, presentation slide decks (PPTX), and GitHub monorepos across 10 engineering milestones.",
  icons: {
    icon: "/asl-logo.png",
    apple: "/asl-logo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased dark`}
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var origSetAttr = Element.prototype.setAttribute;
                  Element.prototype.setAttribute = function(name, value) {
                    if (
                      typeof name === 'string' &&
                      (name === 'bis_skin_checked' ||
                       name === 'bis_register' ||
                       name.indexOf('bis_') === 0 ||
                       name.indexOf('__processed_') === 0)
                    ) {
                      return;
                    }
                    return origSetAttr.apply(this, arguments);
                  };

                  try {
                    Object.defineProperty(Element.prototype, 'bis_skin_checked', {
                      get: function() { return undefined; },
                      set: function() {},
                      configurable: true
                    });
                  } catch(e) {}

                  if (typeof document !== 'undefined') {
                    var stripAttrs = function(node) {
                      if (!node || !node.attributes) return;
                      for (var i = node.attributes.length - 1; i >= 0; i--) {
                        var a = node.attributes[i].name;
                        if (a === 'bis_skin_checked' || a === 'bis_register' || a.indexOf('bis_') === 0 || a.indexOf('__processed_') === 0) {
                          node.removeAttribute(a);
                        }
                      }
                    };
                    stripAttrs(document.documentElement);
                    stripAttrs(document.body);

                    var obs = new MutationObserver(function(mutations) {
                      for (var i = 0; i < mutations.length; i++) {
                        var m = mutations[i];
                        if (m.type === 'attributes') {
                          var n = m.attributeName;
                          if (n && (n === 'bis_skin_checked' || n === 'bis_register' || n.indexOf('bis_') === 0 || n.indexOf('__processed_') === 0)) {
                            m.target.removeAttribute(n);
                          }
                        }
                      }
                    });
                    obs.observe(document.documentElement, { attributes: true, subtree: true });
                  }

                  function isExtensionError(text) {
                    if (!text) return false;
                    var str = String(text);
                    return (
                      str.indexOf('chrome-extension://') !== -1 ||
                      str.indexOf('moz-extension://') !== -1 ||
                      str.indexOf('safari-extension://') !== -1 ||
                      str.indexOf('content.js') !== -1 ||
                      str.indexOf('executors/') !== -1 ||
                      str.indexOf('M_ID') !== -1 ||
                      str.indexOf('nimlmejbmnecnaghgmbahmbaddhjbecg') !== -1 ||
                      str.indexOf('Unexpected end of JSON input') !== -1
                    );
                  }

                  // Intercept console.error
                  var origConsoleError = console.error;
                  console.error = function() {
                    for (var i = 0; i < arguments.length; i++) {
                      var a = arguments[i];
                      var s = (a && (a.stack || a.message || String(a))) + '';
                      if (isExtensionError(s)) return;
                    }
                    return origConsoleError.apply(console, arguments);
                  };

                  // Intercept window.addEventListener to wrap Next.js dev overlay listeners
                  var origAddEventListener = window.addEventListener;
                  window.addEventListener = function(type, listener, options) {
                    if (type === 'unhandledrejection' && typeof listener === 'function') {
                      var wrapped = function(event) {
                        try {
                          var r = event && event.reason;
                          var s = (r ? (r.stack || '') + ' ' + (r.message || '') + ' ' + String(r) : '') + '';
                          if (isExtensionError(s)) {
                            event.preventDefault();
                            if (event.stopImmediatePropagation) event.stopImmediatePropagation();
                            return;
                          }
                        } catch(e) {}
                        return listener.apply(this, arguments);
                      };
                      return origAddEventListener.call(this, type, wrapped, options);
                    }
                    if (type === 'error' && typeof listener === 'function') {
                      var wrappedError = function(event) {
                        try {
                          var fn = (event && event.filename || '') + '';
                          var r = event && event.error;
                          var s = (r ? (r.stack || '') + ' ' + (r.message || '') + ' ' + String(r) : '') + '';
                          var msg = (event && event.message || '') + '';
                          if (isExtensionError(fn) || isExtensionError(s) || isExtensionError(msg)) {
                            event.preventDefault();
                            if (event.stopImmediatePropagation) event.stopImmediatePropagation();
                            return true;
                          }
                        } catch(e) {}
                        return listener.apply(this, arguments);
                      };
                      return origAddEventListener.call(this, type, wrappedError, options);
                    }
                    return origAddEventListener.apply(this, arguments);
                  };

                  // Direct capture listeners
                  origAddEventListener.call(window, 'unhandledrejection', function(event) {
                    try {
                      var reason = event && event.reason;
                      var stack = (reason ? (reason.stack || '') + ' ' + (reason.message || '') + ' ' + String(reason) : '') + '';
                      if (isExtensionError(stack)) {
                        event.preventDefault();
                        if (event.stopImmediatePropagation) event.stopImmediatePropagation();
                      }
                    } catch(e) {}
                  }, true);

                  origAddEventListener.call(window, 'error', function(event) {
                    try {
                      var fn = (event.filename || '') + '';
                      var st = (event.error && (event.error.stack || event.error.message || String(event.error)) || '') + '';
                      var msg = (event.message || '') + '';
                      if (isExtensionError(fn) || isExtensionError(st) || isExtensionError(msg)) {
                        event.preventDefault();
                        if (event.stopImmediatePropagation) event.stopImmediatePropagation();
                        return true;
                      }
                    } catch(e) {}
                  }, true);
                } catch(e) {}
              })();
            `,
          }}
        />
      </head>
      <body suppressHydrationWarning className="min-h-full flex flex-col bg-[#060913] text-slate-100">{children}</body>
    </html>
  );
}
