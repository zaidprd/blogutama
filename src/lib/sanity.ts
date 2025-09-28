// src/lib/sanity.ts (VERSI TANPA INSIGHT)

import { createClient } from "@sanity/client";
import imageUrlBuilder from "@sanity/image-url";
import type { SanityImageSource } from "@sanity/image-url/lib/types/types";

// ------------------------------------------------------------------
// KONFIGURASI DAN CLIENT
// ------------------------------------------------------------------
export const sanityConfig = {
  projectId: import.meta.env.SANITY_PROJECT_ID,
  dataset: import.meta.env.SANITY_DATASET,
  apiVersion: "2023-05-03",
  token: import.meta.env.SANITY_READ_TOKEN,
  useCdn: true,
};

export const sanityClient = createClient(sanityConfig);

const builder = imageUrlBuilder(sanityConfig);

export function urlFor(source: SanityImageSource) {
  return builder.image(source);
}

// ------------------------------------------------------------------
// INTERFACES
// ------------------------------------------------------------------

export interface SanityPost {
  _id: string;
  title: string;
  slug: string;
  pubDate: string;
  excerpt: string;
  body: any; 

  imageUrl: string | null;
  imageAlt: string | null;

  cardImage: string | null;
  cardImageAlt: string | null;
  tags?: string[]; 

  authorName: string;
  authorRole: string;
  authorImage: string | null;
  authorImageAlt: string | null;
  readTime: number | null; 
}


// ------------------------------------------------------------------
// FUNGSI FETCH UTAMA (UNTUK index.astro)
// ------------------------------------------------------------------

/**
 * Mengambil semua post blog (Untuk index.astro).
 */
export async function getAllPosts(): Promise<SanityPost[]> {
    const readTimeFormula = `round(length(pt::text(body)) / 5 / 60)`; 

    const postQuery = `
      *[_type == "post" && defined(slug.current)] | order(publishedAt desc) {
        _id,
        title,
        "slug": slug.current,
        "pubDate": publishedAt,
        "excerpt": array::join(body[0].children[0].text, ""),
        "readTime": ${readTimeFormula},
        
        "imageUrl": mainImage.asset->url,
        "imageAlt": coalesce(mainImage.alt, ""),
        "cardImage": mainImage.asset->url,
        "cardImageAlt": coalesce(mainImage.alt, ""),

        "authorName": authors[0]->name,
        "authorRole": authors[0]->role,
        "authorImage": authors[0]->image.asset->url,
        "authorImageAlt": coalesce(authors[0]->image.alt, "")
      }
    `;

    const allPosts = await sanityClient.fetch(postQuery);
    return allPosts as SanityPost[];
}

// ------------------------------------------------------------------
// FUNGSI FETCH DETAIL POST & RELATED
// ------------------------------------------------------------------

/**
 * Mengambil semua slug post blog untuk getStaticPaths.
 */
export async function getAllPostSlugs(): Promise<{ slug: string }[]> {
    const slugQuery = `
      *[_type == "post" && defined(slug.current)][] { 
        "slug": slug.current
      }
    `;
    return sanityClient.fetch(slugQuery);
}

/**
 * Mengambil post tunggal berdasarkan slug, plus post terkait (3 post).
 */
export async function getPostAndRelated(slug: string): Promise<{ post: SanityPost | null, relatedPosts: SanityPost[] }> {
    const readTimeFormula = `round(length(pt::text(body)) / 5 / 60)`; 
    
    const postQuery = `
      {
        "post": *[_type == "post" && slug.current == $slug][0] {
            _id,
            title,
            "slug": slug.current,
            "pubDate": publishedAt,
            "excerpt": array::join(body[0].children[0].text, ""),
            
            body, 
            
            "readTime": ${readTimeFormula}, 
            
            "imageUrl": mainImage.asset->url,
            "imageAlt": coalesce(mainImage.alt, ""),
            "cardImage": mainImage.asset->url,
            "cardImageAlt": coalesce(mainImage.alt, ""),
            // tags[]->title dihilangkan karena tipe data tag tidak dikirimkan
            
            "authorName": authors[0]->name,
            "authorRole": authors[0]->role,
            "authorImage": authors[0]->image.asset->url,
            "authorImageAlt": coalesce(authors[0]->image.alt, "")
        },
        "relatedPosts": *[_type == "post" && slug.current != $slug] | order(publishedAt desc)[0..2] {
            _id,
            title,
            "slug": slug.current,
            "pubDate": publishedAt,
            "excerpt": array::join(body[0].children[0].text, ""),
            
            "readTime": ${readTimeFormula}, 
            
            "imageUrl": mainImage.asset->url,
            "imageAlt": coalesce(mainImage.alt, ""),
            "cardImage": mainImage.asset->url,
            "cardImageAlt": coalesce(mainImage.alt, ""),
            
            "authorName": authors[0]->name,
            "authorRole": authors[0]->role,
            "authorImage": authors[0]->image.asset->url,
            "authorImageAlt": coalesce(authors[0]->image.alt, "")
        }
      }
    `;

    const result = await sanityClient.fetch(postQuery, { slug });

    return {
        post: result.post as SanityPost,
        relatedPosts: result.relatedPosts as SanityPost[],
    };
}