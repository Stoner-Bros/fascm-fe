'use client';

export default function GlobalError() {
  return (
    <html>
      <body>
        {/* `NextError` is the default Next.js error page component. Its type
        definition requires a `statusCode` prop. However, since the App Router
        does not expose status codes for errors, we simply pass 0 to render a
        generic error message. */}
        <div>
          <h1>Something went wrong!</h1>
          <p>An error occurred while processing your request.</p>
        </div>
      </body>
    </html>
  );
}
