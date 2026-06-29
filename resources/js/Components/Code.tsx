import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism';

export const ApiResponseCode = ({
  code,
  title,
  language = 'json',
}: {
  code: string | string[];
  title: string;
  language?: string;
}) => {
  const parsed = Array.isArray(code) ? code.join('\n') : code;

  return (
    <div className="overflow-hidden rounded-md border border-[#e1dfd7] bg-[#eceae3]">
      <div className="border-b border-black/10 bg-[#e1dfd7] px-4 py-2 font-mono text-[0.65rem] font-medium uppercase tracking-[0.08em] text-[#7a7a85]">
        {title}
      </div>

      <SyntaxHighlighter
        language={language}
        style={oneLight}
        customStyle={{
          margin: 0,
          padding: '1rem',
          background: '#eceae3',
          fontSize: '0.75rem',
          lineHeight: '1.6',
          overflowX: 'auto',
        }}
        codeTagProps={{
          className: 'font-mono',
        }}
      >
        {parsed}
      </SyntaxHighlighter>
    </div>
  );
};

export function SdkCode({
  code,
  language = 'ts',
}: {
  code: string | string[];
  language?: string;
}) {
  const parsed = Array.isArray(code) ? code.join('\n') : code;

  return (
    <div className="my-4 max-w-full overflow-hidden rounded-md bg-[#0e0e0f]">
      <SyntaxHighlighter
        language={language}
        style={oneDark}
        customStyle={{
          margin: 0,
          padding: '1rem 1.25rem',
          background: '#0e0e0f',
          fontSize: '0.82rem',
          lineHeight: '1.6',
          overflowX: 'auto',
        }}
        codeTagProps={{
          className: 'font-mono',
        }}
      >
        {parsed}
      </SyntaxHighlighter>
    </div>
  );
}
