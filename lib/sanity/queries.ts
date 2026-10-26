import { defineQuery } from "next-sanity";

const photo = `{ asset, hotspot, crop, alt, caption, creditTitle, creditAuthor, creditLicense, creditLicenseUrl, creditSourceUrl }`;

export const attractionsQuery = defineQuery(`*[_type == "attraction" && defined(slug.current)] | order(order asc, name asc) {
  _id,
  name,
  "slug": slug.current,
  "category": category->title,
  description,
  body,
  address,
  "lat": location.lat,
  "lng": location.lng,
  operatingStatus,
  notice,
  sourceUrl,
  sourceLabel,
  additionalSource,
  checked,
  featured,
  seo,
  "heroImage": heroImage ${photo},
  "gallery": gallery[] ${photo},
  historyIntro,
  "historySections": historySections[] { heading, body },
  "stories": stories[] { kind, title, body, sourceUrl, sourceLabel },
  "historySources": historySources[] { label, url },
  "relatedGuides": relatedGuides[]->slug.current
}`);

export const guidesQuery = defineQuery(`*[_type == "guide" && defined(slug.current)] | order(order asc, title asc) {
  _id,
  title,
  shortTitle,
  "slug": slug.current,
  "category": category->title,
  description,
  intro,
  highlights,
  "heroImage": heroImage ${photo},
  "imageCaption": heroImage.caption,
  sections[] { id, title, body },
  faqs[] { question, answer },
  sources[] { label, url },
  "related": relatedGuides[]->slug.current,
  updated,
  seo
}`);

const topicFields = `{
  _id,
  title,
  "slug": slug.current,
  eyebrow,
  summary,
  intro,
  highlights,
  "heroImage": heroImage ${photo},
  sections[] { title, body },
  faqs[] { question, answer },
  placesHeading,
  placesIntro,
  "placeSlugs": places[]->slug.current,
  "guides": guides[]->slug.current,
  sources[] { label, url },
  seo
}`;

export const experiencesQuery = defineQuery(
  `*[_type == "experience" && defined(slug.current)] | order(order asc, title asc) ${topicFields}`,
);
export const neighbourhoodsQuery = defineQuery(
  `*[_type == "neighbourhood" && defined(slug.current)] | order(order asc, title asc) ${topicFields}`,
);

export const settingsQuery = defineQuery(`*[_id == "siteSettings"][0] {
  "featuredAttractions": featuredAttractions[]->slug.current,
  "featuredGuides": featuredGuides[]->slug.current,
  seo
}`);
