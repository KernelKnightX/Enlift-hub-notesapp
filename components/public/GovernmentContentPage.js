'use client';

import { SchemePageLayout } from './SchemePageLayout';

// A thin reusable wrapper that maps a generic government page configuration
// into the existing SchemePageLayout implementation. This allows all
// government dropdown pages to share the same visual architecture and
// responsive behaviors while keeping the configuration/data separate.

export default function GovernmentContentPage({
  config = {},
  items = [],
  loading = false,
  onSearch,
  searchQuery = '',
  breadcrumbs = null,
}) {
  const {
    title = 'Government Content',
    description = '',
    heroImage,
    categories = [],
    statistics = [],
  } = config;

  return (
    <SchemePageLayout
      title={title}
      description={description}
      heroImage={heroImage}
      schemes={items}
      categories={categories}
      loading={loading}
      onSearch={onSearch}
      searchQuery={searchQuery}
      statistics={statistics}
      breadcrumbs={breadcrumbs}
    />
  );
}
