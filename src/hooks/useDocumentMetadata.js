import { useEffect } from 'react';

/**
 * Custom React Hook to dynamically inject document metadata and JSON-LD schemas.
 * 
 * @param {Object} metadata
 * @param {string} metadata.title - Page title
 * @param {string} metadata.description - Meta description
 * @param {Object} [metadata.openGraph] - OpenGraph parameters
 * @param {string} [metadata.openGraph.title]
 * @param {string} [metadata.openGraph.description]
 * @param {string} [metadata.openGraph.image]
 * @param {string} [metadata.openGraph.url]
 * @param {string} [metadata.openGraph.type]
 * @param {Object} [metadata.twitter] - Twitter card parameters
 * @param {string} [metadata.twitter.card]
 * @param {string} [metadata.twitter.title]
 * @param {string} [metadata.twitter.description]
 * @param {string} [metadata.twitter.image]
 * @param {Object|Array} [metadata.jsonLd] - JSON-LD schema object(s)
 */
export default function useDocumentMetadata({
    title,
    description,
    openGraph = {},
    twitter = {},
    jsonLd
} = {}) {
    useEffect(() => {
        // Update document title
        if (title) {
            document.title = title;
        }

        const tagsToUpdate = [];

        if (description) {
            tagsToUpdate.push({ name: 'description', content: description });
        }

        // OpenGraph metadata
        if (openGraph.title) tagsToUpdate.push({ property: 'og:title', content: openGraph.title });
        if (openGraph.description) tagsToUpdate.push({ property: 'og:description', content: openGraph.description });
        if (openGraph.image) tagsToUpdate.push({ property: 'og:image', content: openGraph.image });
        if (openGraph.url) tagsToUpdate.push({ property: 'og:url', content: openGraph.url });
        if (openGraph.type) tagsToUpdate.push({ property: 'og:type', content: openGraph.type || 'website' });

        // Twitter metadata
        if (twitter.card) tagsToUpdate.push({ name: 'twitter:card', content: twitter.card || 'summary_large_image' });
        if (twitter.title) tagsToUpdate.push({ name: 'twitter:title', content: twitter.title });
        if (twitter.description) tagsToUpdate.push({ name: 'twitter:description', content: twitter.description });
        if (twitter.image) tagsToUpdate.push({ name: 'twitter:image', content: twitter.image });

        const createdElements = [];

        // Apply metadata tags to <head>
        tagsToUpdate.forEach(({ name, property, content }) => {
            if (!content) return;
            let element;
            if (name) {
                element = document.querySelector(`meta[name="${name}"]`);
                if (!element) {
                    element = document.createElement('meta');
                    element.setAttribute('name', name);
                    document.head.appendChild(element);
                    createdElements.push(element);
                }
            } else if (property) {
                element = document.querySelector(`meta[property="${property}"]`);
                if (!element) {
                    element = document.createElement('meta');
                    element.setAttribute('property', property);
                    document.head.appendChild(element);
                    createdElements.push(element);
                }
            }
            if (element) {
                element.setAttribute('content', content);
            }
        });

        // Apply dynamic JSON-LD
        let scriptElement = null;
        if (jsonLd) {
            scriptElement = document.createElement('script');
            scriptElement.type = 'application/ld+json';
            scriptElement.text = JSON.stringify(jsonLd);
            document.head.appendChild(scriptElement);
        }

        // Cleanup: remove created meta/script tags on component unmount
        return () => {
            createdElements.forEach(el => {
                if (el && el.parentNode) {
                    el.parentNode.removeChild(el);
                }
            });
            if (scriptElement && scriptElement.parentNode) {
                scriptElement.parentNode.removeChild(scriptElement);
            }
        };
    }, [title, description, JSON.stringify(openGraph), JSON.stringify(twitter), JSON.stringify(jsonLd)]);
}
