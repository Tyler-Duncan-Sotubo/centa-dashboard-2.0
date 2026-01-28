import React from "react";

interface RenderHtmlProps {
  html: string;
}

const RenderHtml: React.FC<RenderHtmlProps> = ({ html }) => {
  return (
    <div className="text-xmd bg-muted font-bold mb-2 px-5 py-6 mt-2 flex items-start">
      <style jsx global>{`
        .content p {
          margin-bottom: 1rem;
          line-height: 1.6;
        }
        .content h3 {
          margin: 1.5rem 0 0.75rem;
          font-size: 1.125rem;
        }
        .content hr {
          margin: 2rem 0;
          border: none;
          border-top: 1px solid #ddd;
        }
        .content table {
          border-collapse: collapse;
          width: 100%;
          margin-top: 1rem;
        }
        .content th,
        .content td {
          border: 1px solid #ccc;
          padding: 6px 8px;
          text-align: left;
        }

        /* Custom bullets for unordered lists */
        .content ul {
          padding-left: 1.5rem;
          list-style: none;
        }
        .content ul li {
          position: relative;
          padding-left: 1.25rem;
          margin-bottom: 0.5rem;
        }
        .content ul li::before {
          content: "•"; /* or use a Unicode icon: "✔", "➤", etc. */
          position: absolute;
          left: 0;
          color: #4bb78f; /* custom bullet color */
          font-weight: bold;
        }

        /* Optional: style for ordered list */
        .content ol {
          padding-left: 1.5rem;
          list-style-type: decimal;
          margin-bottom: 1rem;
        }
        .content ol li {
          margin-bottom: 0.5rem;
        }
      `}</style>

      <div className="content" dangerouslySetInnerHTML={{ __html: html }} />
    </div>
  );
};

export default RenderHtml;
