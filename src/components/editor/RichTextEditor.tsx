import React from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import { Bold, Italic, List, ListOrdered, Image as ImageIcon } from 'lucide-react';

interface RichTextEditorProps {
  content: string;
  onChange: (content: string) => void;
}

const RichTextEditor: React.FC<RichTextEditorProps> = ({ content, onChange }) => {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Image.configure({
        HTMLAttributes: {
          class: 'max-w-full rounded-lg',
        },
      }),
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  const addImage = () => {
    const url = window.prompt('Enter image URL');
    if (url && editor) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  };

  if (!editor) {
    return null;
  }

  return (
    <div className="border rounded-lg overflow-hidden">
      <div className="flex items-center space-x-2 p-2 border-b bg-gray-50">
        <button
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`p-1 rounded ${editor.isActive('bold') ? 'bg-gray-200' : 'hover:bg-gray-200'}`}
        >
          <Bold className="h-4 w-4" />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`p-1 rounded ${editor.isActive('italic') ? 'bg-gray-200' : 'hover:bg-gray-200'}`}
        >
          <Italic className="h-4 w-4" />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`p-1 rounded ${editor.isActive('bulletList') ? 'bg-gray-200' : 'hover:bg-gray-200'}`}
        >
          <List className="h-4 w-4" />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={`p-1 rounded ${editor.isActive('orderedList') ? 'bg-gray-200' : 'hover:bg-gray-200'}`}
        >
          <ListOrdered className="h-4 w-4" />
        </button>
        <button
          onClick={addImage}
          className="p-1 rounded hover:bg-gray-200"
        >
          <ImageIcon className="h-4 w-4" />
        </button>
      </div>
      <EditorContent editor={editor} className="p-4 min-h-[200px] prose max-w-none" />
    </div>
  );
};

export default RichTextEditor;