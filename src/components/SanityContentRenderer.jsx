// src/components/SanityContentRenderer.jsx

import React from 'react';
import { PortableText } from '@portabletext/react';
import { urlFor } from "@/lib/sanity";

/**
 * @typedef {import('@portabletext/types').PortableTextBlock[]} PortableTextBlockArray
 * * @param {{ body: PortableTextBlockArray }} props
 */
export default function SanityContentRenderer({ body }) {
    
    // Definisikan komponen kustom (seperti cara merender gambar Sanity, heading, paragraf, dan list).
    const components = {
        types: {
            image: ({ value }) => {
                const imageUrl = urlFor(value).url(); 
                const altText = value.alt || "Konten Gambar";

                return (
                    // Memberi jarak di sekitar gambar.
                    <figure className="my-8"> 
                        <img 
                            src={imageUrl} 
                            alt={altText} 
                            loading="lazy" 
                            width={1200}
                            height={675}
                            className="rounded-lg shadow-lg mx-auto" 
                        />
                        {value.caption && <figcaption className="text-center text-sm mt-2 text-neutral-500 dark:text-neutral-400">{value.caption}</figcaption>}
                    </figure>
                );
            },
        },
        block: {
            // Heading H2: Menambahkan Spacing (mt-10 mb-4), Ukuran, Font, dan Warna (Dark Mode)
            h2: ({children, value}) => {
                const id = value.children[0].text.toLowerCase().replace(/\s/g, '-').replace(/[^\w-]/g, '');
                return (
                    <h2 
                        id={id} 
                        className="mt-10 mb-4 text-2xl font-bold md:text-3xl text-neutral-800 dark:text-white"
                    >
                        {children}
                    </h2>
                );
            },
            // Heading H3: Menambahkan Spacing (mt-8 mb-3), Ukuran, Font, dan Warna (Dark Mode)
            h3: ({children, value}) => {
                const id = value.children[0].text.toLowerCase().replace(/\s/g, '-').replace(/[^\w-]/g, '');
                return (
                    <h3 
                        id={id} 
                        className="mt-8 mb-3 text-xl font-bold md:text-2xl text-neutral-800 dark:text-white"
                    >
                        {children}
                    </h3>
                );
            },
            // Paragraf Normal: Menambahkan Spacing (mt-6) dan Warna (Dark Mode)
            normal: ({ children }) => (
                <p className="mt-6 leading-relaxed text-neutral-700 dark:text-neutral-300">
                    {children}
                </p>
            ),
            
            // Blockquote: Menambahkan Spacing dan Warna (Dark Mode)
            blockquote: ({ children }) => (
                <blockquote className="my-6 border-l-4 border-orange-500 pl-4 py-2 italic text-neutral-600 dark:text-neutral-400">
                    {children}
                </blockquote>
            ),
        },
        // Styling untuk List (Daftar)
        list: {
            // Unordered List (Bullet point): Menambahkan Spacing dan Warna (Dark Mode)
            bullet: ({ children }) => (
                <ul className="my-6 ml-6 list-disc space-y-2 text-neutral-700 dark:text-neutral-300">
                    {children}
                </ul>
            ),
            // Ordered List (Penomoran): Menambahkan Spacing dan Warna (Dark Mode)
            number: ({ children }) => (
                <ol className="my-6 ml-6 list-decimal space-y-2 text-neutral-700 dark:text-neutral-300">
                    {children}
                </ol>
            ),
        },
        listItem: {
            // list items mewarisi warna dari <ul> atau <ol>
            bullet: ({ children }) => <li className="leading-relaxed">{children}</li>,
            number: ({ children }) => <li className="leading-relaxed">{children}</li>,
        },
    };

    return (
        <div className="sanity-content">
            <PortableText value={body} components={components} />
        </div>
    );
}