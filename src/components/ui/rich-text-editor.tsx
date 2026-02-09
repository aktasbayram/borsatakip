"use client";

import { useEditor, EditorContent, Editor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import Underline from '@tiptap/extension-underline';
import { Button } from '@/components/ui/button';
import {
    Bold,
    Italic,
    Underline as UnderlineIcon,
    Strikethrough,
    List,
    ListOrdered,
    Quote,
    Heading1,
    Heading2,
    Heading3,
    Undo,
    Redo,
    Image as ImageIcon,
    Link as LinkIcon,
} from 'lucide-react';
import MarkdownIt from 'markdown-it';
import { useEffect, useState } from 'react';

const mdParser = new MarkdownIt();

interface RichTextEditorProps {
    content: string;
    onChange: (html: string) => void;
    placeholder?: string;
    editable?: boolean;
}

const MenuBar = ({ editor }: { editor: Editor | null }) => {
    if (!editor) {
        return null;
    }

    const addImage = () => {
        const url = window.prompt('URL');

        if (url) {
            editor.chain().focus().setImage({ src: url }).run();
        }
    };

    const setLink = () => {
        const previousUrl = editor.getAttributes('link').href;
        const url = window.prompt('URL', previousUrl);

        // cancelled
        if (url === null) {
            return;
        }

        // empty
        if (url === '') {
            editor.chain().focus().extendMarkRange('link').unsetLink().run();
            return;
        }

        // update link
        editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
    };

    return (
        <div className="flex flex-wrap items-center gap-1 p-2 border-b border-border bg-muted/40 rounded-t-lg">
            <Button
                variant={editor.isActive('bold') ? "secondary" : "ghost"}
                size="icon"
                className="h-8 w-8"
                onClick={() => editor.chain().focus().toggleBold().run()}
                aria-label="Toggle bold"
            >
                <Bold className="h-4 w-4" />
            </Button>
            <Button
                variant={editor.isActive('italic') ? "secondary" : "ghost"}
                size="icon"
                className="h-8 w-8"
                onClick={() => editor.chain().focus().toggleItalic().run()}
                aria-label="Toggle italic"
            >
                <Italic className="h-4 w-4" />
            </Button>
            <Button
                variant={editor.isActive('underline') ? "secondary" : "ghost"}
                size="icon"
                className="h-8 w-8"
                onClick={() => editor.chain().focus().toggleUnderline().run()}
                aria-label="Toggle underline"
            >
                <UnderlineIcon className="h-4 w-4" />
            </Button>
            <Button
                variant={editor.isActive('strike') ? "secondary" : "ghost"}
                size="icon"
                className="h-8 w-8"
                onClick={() => editor.chain().focus().toggleStrike().run()}
                aria-label="Toggle strikethrough"
            >
                <Strikethrough className="h-4 w-4" />
            </Button>

            <div className="w-px h-6 bg-border mx-1" />

            <Button
                variant={editor.isActive('heading', { level: 1 }) ? "secondary" : "ghost"}
                size="icon"
                className="h-8 w-8"
                onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                aria-label="Heading 1"
            >
                <Heading1 className="h-4 w-4" />
            </Button>
            <Button
                variant={editor.isActive('heading', { level: 2 }) ? "secondary" : "ghost"}
                size="icon"
                className="h-8 w-8"
                onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                aria-label="Heading 2"
            >
                <Heading2 className="h-4 w-4" />
            </Button>
            <Button
                variant={editor.isActive('heading', { level: 3 }) ? "secondary" : "ghost"}
                size="icon"
                className="h-8 w-8"
                onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
                aria-label="Heading 3"
            >
                <Heading3 className="h-4 w-4" />
            </Button>

            <div className="w-px h-6 bg-border mx-1" />

            <Button
                variant={editor.isActive('bulletList') ? "secondary" : "ghost"}
                size="icon"
                className="h-8 w-8"
                onClick={() => editor.chain().focus().toggleBulletList().run()}
                aria-label="Bullet list"
            >
                <List className="h-4 w-4" />
            </Button>
            <Button
                variant={editor.isActive('orderedList') ? "secondary" : "ghost"}
                size="icon"
                className="h-8 w-8"
                onClick={() => editor.chain().focus().toggleOrderedList().run()}
                aria-label="Ordered list"
            >
                <ListOrdered className="h-4 w-4" />
            </Button>
            <Button
                variant={editor.isActive('blockquote') ? "secondary" : "ghost"}
                size="icon"
                className="h-8 w-8"
                onClick={() => editor.chain().focus().toggleBlockquote().run()}
                aria-label="Blockquote"
            >
                <Quote className="h-4 w-4" />
            </Button>

            <div className="w-px h-6 bg-border mx-1" />

            <Button
                variant={editor.isActive('link') ? "secondary" : "ghost"}
                size="icon"
                className="h-8 w-8"
                onClick={setLink}
                aria-label="Link"
            >
                <LinkIcon className="h-4 w-4" />
            </Button>
            <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={addImage}
                aria-label="Image"
            >
                <ImageIcon className="h-4 w-4" />
            </Button>

            <div className="w-px h-6 bg-border mx-1" />

            <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => editor.chain().focus().undo().run()}
                disabled={!editor.can().undo()}
                aria-label="Undo"
            >
                <Undo className="h-4 w-4" />
            </Button>
            <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => editor.chain().focus().redo().run()}
                disabled={!editor.can().redo()}
                aria-label="Redo"
            >
                <Redo className="h-4 w-4" />
            </Button>
        </div>
    );
};

export default function RichTextEditor({ content, onChange, placeholder, editable = true }: RichTextEditorProps) {
    const [init, setInit] = useState(false);

    const editor = useEditor({
        extensions: [
            StarterKit,
            Image,
            Underline,
            Link.configure({
                openOnClick: false,
                HTMLAttributes: {
                    class: 'text-primary underline cursor-pointer',
                },
            }),
            Placeholder.configure({
                placeholder: placeholder || 'İçeriğinizi buraya yazın...',
            }),
        ],
        content: content, // Initial content
        onUpdate: ({ editor }) => {
            onChange(editor.getHTML());
        },
        editable: editable,
        editorProps: {
            attributes: {
                class: 'prose dark:prose-invert prose-sm sm:prose lg:prose-lg xl:prose-xl focus:outline-none min-h-[300px] p-4 max-w-none',
            },
        },
        immediatelyRender: false,
    });

    // Handle initial content load (HTML vs Markdown)
    useEffect(() => {
        if (editor && content && !init) {
            // Check if content looks like HTML
            const isHtml = /<[a-z][\s\S]*>/i.test(content);
            if (!isHtml && content.trim().length > 0) {
                // Assume Markdown and convert
                const html = mdParser.render(content);
                editor.commands.setContent(html);
            } else if (content !== editor.getHTML()) {
                // If HTML provided differs from editor state (and not just empty vs <p></p>)
                // Tiptap might add wrapper tags, so be careful.
                // Ideally we set content once.
                if (editor.isEmpty && content.trim().length > 0) {
                    editor.commands.setContent(content);
                }
            }
            setInit(true);
        }
    }, [content, editor, init]);

    return (
        <div className="border border-input rounded-lg overflow-hidden bg-background shadow-sm focus-within:ring-2 focus-within:ring-ring focus-within:border-primary transition-all">
            <MenuBar editor={editor} />
            <EditorContent editor={editor} />
        </div>
    );
}
