import { SchemePageLayout } from './SchemePageLayout';

export default function GovernmentContentPage({
  config = {},
  items = [],
  loading = false,
  onSearch,
  searchQuery = '',
  breadcrumbs = null,
  sectionSlug = 'schemes',
}) {
  const {
    title = 'Government Content',
    description = '',
    heroImage,
    categories = [],
    statistics = [],
    gridTitle,
    itemLabel = 'items',
    searchPlaceholder,
    showFilterBar = false,
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
      sectionSlug={sectionSlug}
      gridTitle={gridTitle || title}
      itemLabel={itemLabel}
      searchPlaceholder={searchPlaceholder}
      showFilterBar={showFilterBar}
    />
  );
}
