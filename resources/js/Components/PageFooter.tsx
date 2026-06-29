export function PageFooter({ appName }: { appName: string }) {
  return (
    <footer className="flex flex-col items-center justify-between gap-2 border-t border-black/10 px-6 py-8 text-center text-xs text-[#7a7a85] md:flex-row md:px-12 md:text-left">
      <span>© 2025 {appName}. Released under the MIT License.</span>

      <span>
        Compatible with{' '}
        <a
          className="text-[#7a7a85] transition hover:text-[#e85d26]"
          href="https://lorem.toneflix.com.ng"
          target="_blank"
          rel="noreferrer"
        >
          Lorem Toneflix
        </a>{' '}
        API
      </span>
    </footer>
  );
}

export function SdkFooter({
  appName,
  baseUrl,
}: {
  appName: string;
  baseUrl: string;
}) {
  return (
    <footer className="border-t border-black/10 px-6 py-8 text-center text-sm text-[#7a7a85]">
      {appName} ·{' '}
      <a
        className="text-[#e85d26] transition hover:text-[#f28c5e]"
        href={baseUrl}
      >
        back to home
      </a>
    </footer>
  );
}
