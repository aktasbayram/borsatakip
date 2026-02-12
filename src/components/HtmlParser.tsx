import React from 'react';
import * as cheerio from 'cheerio';

interface HtmlParserProps {
    html: string;
    context?: 'head' | 'body';
}

const VALID_HEAD_TAGS = ['script', 'link', 'style', 'meta', 'title', 'base', 'noscript'];

export const HtmlParser = ({ html, context = 'body' }: HtmlParserProps) => {
    if (!html) return null;

    const $ = cheerio.load(html, {
        xmlMode: true,
        decodeEntities: false
    } as any);

    const elements = $.root().children().toArray().filter((el: any) => el.type === 'tag');

    return (
        <>
            {elements.map((el: any, index: number) => {
                const TagName = el.tagName as any;
                const Props = el.attribs || {};

                // Filter invalid tags for Head context to prevent Hydration errors
                if (context === 'head' && !VALID_HEAD_TAGS.includes(TagName)) {
                    return null;
                }

                // Handle script content
                if (TagName === 'script' && el.children.length > 0) {
                    const content = el.children[0].data || '';
                    return (
                        <script
                            key={index}
                            {...Props}
                            dangerouslySetInnerHTML={{ __html: content }}
                        />
                    );
                }

                // Handle style content
                if (TagName === 'style' && el.children.length > 0) {
                    const content = el.children[0].data || '';
                    return (
                        <style
                            key={index}
                            {...Props}
                            dangerouslySetInnerHTML={{ __html: content }}
                        />
                    );
                }

                // Standard tags
                return <TagName key={index} {...Props} />;
            })}
        </>
    );
};
