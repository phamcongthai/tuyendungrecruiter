import React, { useEffect, useId, useRef, useState } from 'react';

type RichTextEditorProps = {
  value?: string;
  onChange?: (content: string) => void;
  height?: number;
  placeholder?: string;
};

declare global {
  interface Window { tinymce?: any }
}

const CDN_BASE = `https://cdn.tiny.cloud/1/${import.meta.env.VITE_TINYMCE_API_KEY || 'qz10yuhef8kzizr2wmlhyd1okqgj3800au0y4fpdycx4vnsb'}/tinymce/6`;

const RichTextEditor: React.FC<RichTextEditorProps> = ({ value, onChange, height = 560, placeholder }) => {
  const id = useId().replace(/[^a-zA-Z0-9_-]/g, '');
  const elementId = `rte_${id}`;
  const editorRef = useRef<any>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const [isScriptReady, setIsScriptReady] = useState<boolean>(!!window.tinymce);

  useEffect(() => {
    if (!isScriptReady) {
      const existing = document.querySelector(`script[data-tiny="cdn"]`) as HTMLScriptElement | null;
      if (existing) {
        existing.addEventListener('load', () => setIsScriptReady(true), { once: true });
      } else {
        const script = document.createElement('script');
        script.src = `${CDN_BASE}/tinymce.min.js`;
        script.referrerPolicy = 'origin';
        script.async = true;
        script.dataset.tiny = 'cdn';
        script.onload = () => setIsScriptReady(true);
        document.head.appendChild(script);
      }
      return;
    }

    if (!window.tinymce || !textareaRef.current) return;

    window.tinymce.init({
      target: textareaRef.current,
      plugins: 'lists link table code autoresize',
      toolbar:
        'undo redo | blocks | bold italic underline | alignleft aligncenter alignright | bullist numlist | link table | removeformat | code',
      menubar: false,
      statusbar: false,
      branding: false,
      height,
      autoresize_bottom_margin: 16,
      placeholder,
      skin_url: `${CDN_BASE}/skins/ui/oxide`,
      content_css: `${CDN_BASE}/skins/content/default/content.min.css`,
      setup: (editor: any) => {
        editorRef.current = editor;
        editor.on('Change KeyUp Undo Redo', () => {
          const content = editor.getContent();
          onChange?.(content);
        });
      },
      init_instance_callback: (editor: any) => {
        if (value) editor.setContent(value);
      },
    });

    return () => {
      try {
        if (editorRef.current && window.tinymce) {
          window.tinymce.remove(editorRef.current);
          editorRef.current = null;
        }
      } catch {}
    };
  }, [elementId, isScriptReady]);

  useEffect(() => {
    if (editorRef.current && typeof value === 'string') {
      const current = editorRef.current.getContent();
      if (current !== value) {
        editorRef.current.setContent(value || '');
      }
    }
  }, [value]);

  return (
    <textarea id={elementId} ref={textareaRef} defaultValue={value} />
  );
};

export default RichTextEditor;


