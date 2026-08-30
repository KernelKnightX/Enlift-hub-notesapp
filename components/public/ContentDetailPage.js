import Image from 'next/image';
import Link from 'next/link';
import {
  BookOpen,
  Building2,
  ChevronRight,
  Compass,
  FileText,
  Gavel,
  Landmark,
  Languages,
  Layers,
  Lightbulb,
  Map,
  MapPin,
  Mountain,
  Network,
  Route,
  ScrollText,
  ShieldCheck,
  Trees,
  Users,
  Waves,
} from 'lucide-react';
import { formatLengthKm } from '@/lib/firestore/maps';

const titleCase = (value = '') => (
  String(value)
    .split('-')
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
);

const hasValue = (value) => value !== undefined && value !== null && value !== '';

const splitList = (value) => {
  if (Array.isArray(value)) return value.filter(Boolean);
  if (!value) return [];
  return String(value)
    .split(/[,;\n]/)
    .map((item) => item.trim())
    .filter(Boolean);
};

const displayValue = (value, fieldKey = '') => {
  if (fieldKey === 'lengthKm' && hasValue(value)) {
    const formatted = formatLengthKm(value);
    if (formatted) return formatted;
  }

  if (Array.isArray(value)) {
    return value
      .map((item) => displayValue(item))
      .filter(Boolean)
      .join(', ');
  }
  if (typeof value === 'object' && value !== null) {
    return value.name || value.title || value.label || value.description || '';
  }
  return value;
};

const categoryProfiles = {
  'india-states': {
    tone: 'state',
    eyebrow: 'Indian State',
    visualLabel: 'State Map',
    introTitle: 'State Profile',
    factTitle: 'UPSC State Hook',
    primaryFields: [
      ['Capital', 'capital', Landmark],
      ['Region', 'region', Compass],
      ['Districts', 'districtsCount', Layers],
      ['Area', 'area', Map],
      ['Official Language', 'officialLanguage', Languages],
      ['Coastline', 'coastlineKm', Waves],
    ],
    sections: [
      { title: 'Administrative Snapshot', fields: [['Capital', 'capital', Landmark], ['Districts', 'districtsCount', Layers], ['Largest City', 'largestCity', Building2]] },
      { title: 'Geography Notes', fields: [['Region', 'region', Compass], ['Area', 'area', Map], ['Coastline', 'coastlineKm', Waves]] },
      { title: 'Important Locations', listKey: 'importantLocations', icon: MapPin },
    ],
  },
  'river-systems': {
    tone: 'river',
    eyebrow: 'River System',
    visualLabel: 'River Course',
    factTitle: 'UPSC River Fact',
    primaryFields: [
      ['Origin', 'origin', MapPin],
      ['Mouth', 'mouth', Waves],
      ['Length', 'lengthKm', Route],
      ['States Covered', 'statesCovered', Map],
    ],
    heroListKey: 'tributaries',
    heroListTitle: 'Major Tributaries',
    sections: [],
    hideIntroSection: true,
    hideRevisionFrame: true,
    compactLayout: true,
  },
  'mountain-ranges': {
    tone: 'mountain',
    eyebrow: 'Mountain Range',
    visualLabel: 'Relief Map',
    introTitle: 'Topography Profile',
    factTitle: 'Mountain Quick Fact',
    primaryFields: [
      ['Highest Peak', 'highestPeak', Mountain],
      ['Length', 'mountainLengthKm', Route],
      ['States Covered', 'mountainStatesCovered', Map],
      ['Formation Era', 'formedEra', Layers],
      ['Region', 'region', Compass],
    ],
    sections: [
      { title: 'Topographic Facts', fields: [['Highest Peak', 'highestPeak', Mountain], ['Length', 'mountainLengthKm', Route], ['Formation Era', 'formedEra', Layers]] },
      { title: 'Location and Spread', fields: [['Region', 'region', Compass], ['States Covered', 'mountainStatesCovered', Map]] },
    ],
  },
  'national-parks': {
    tone: 'park',
    eyebrow: 'National Park',
    visualLabel: 'Protected Area',
    introTitle: 'Park Profile',
    factTitle: 'Environment Quick Fact',
    primaryFields: [
      ['State', 'parkState', MapPin],
      ['Established', 'establishedYear', Landmark],
      ['Area', 'parkArea', Map],
      ['Famous For', 'famousFor', Trees],
      ['Region', 'region', Compass],
    ],
    sections: [
      { title: 'Protected Area Snapshot', fields: [['State', 'parkState', MapPin], ['Established', 'establishedYear', Landmark], ['Area', 'parkArea', Map]] },
      { title: 'Wildlife and Significance', fields: [['Famous For', 'famousFor', Trees], ['UPSC Fact', 'upscFact', Lightbulb]] },
    ],
  },
  'biosphere-reserves': {
    tone: 'reserve',
    eyebrow: 'Biosphere Reserve',
    visualLabel: 'Reserve Map',
    introTitle: 'Reserve Profile',
    factTitle: 'Biodiversity Quick Fact',
    primaryFields: [
      ['States', 'reserveStates', MapPin],
      ['Established', 'reserveEstablishedYear', Landmark],
      ['Core Area', 'coreArea', ShieldCheck],
      ['UNESCO Status', 'unescoStatus', Trees],
      ['Region', 'region', Compass],
    ],
    sections: [
      { title: 'Conservation Profile', fields: [['States', 'reserveStates', MapPin], ['Core Area', 'coreArea', ShieldCheck], ['UNESCO Status', 'unescoStatus', Trees]] },
      { title: 'Exam Relevance', fields: [['Established', 'reserveEstablishedYear', Landmark], ['UPSC Fact', 'upscFact', Lightbulb]] },
    ],
  },
  'important-locations': {
    tone: 'location',
    eyebrow: 'Important Location',
    visualLabel: 'Location Map',
    introTitle: 'Location Profile',
    factTitle: 'Location Quick Fact',
    primaryFields: [
      ['State', 'locationState', MapPin],
      ['Significance', 'significance', Landmark],
      ['Nearby Landmark', 'nearbyLandmark', Compass],
      ['Region', 'region', Map],
    ],
    sections: [
      { title: 'Location Identity', fields: [['State', 'locationState', MapPin], ['Region', 'region', Map], ['Nearby Landmark', 'nearbyLandmark', Compass]] },
      { title: 'Why It Matters', fields: [['Significance', 'significance', Landmark], ['UPSC Fact', 'upscFact', Lightbulb]] },
    ],
  },
  'constitution-articles': {
    tone: 'constitution',
    eyebrow: 'Constitution Article',
    visualLabel: 'Article Reference',
    introTitle: 'Constitutional Provision',
    factTitle: 'Polity Quick Fact',
    primaryFields: [
      ['Article', 'articleNumber', ScrollText],
      ['Part', 'part', BookOpen],
      ['Provision', 'provision', Gavel],
      ['Related Articles', 'relatedArticles', Network],
    ],
    sections: [
      { title: 'Provision and Meaning', fields: [['Article Number', 'articleNumber', ScrollText], ['Provision', 'provision', Gavel], ['Explanation', 'explanation', BookOpen]] },
      { title: 'Important Points', listKey: 'importantPoints', icon: ShieldCheck },
      { title: 'Related Articles', listKey: 'relatedArticles', icon: Network },
    ],
  },
  'important-acts': {
    tone: 'acts',
    eyebrow: 'Important Act',
    visualLabel: 'Act Brief',
    introTitle: 'Legislation Profile',
    factTitle: 'Act Quick Fact',
    primaryFields: [
      ['Year', 'year', Landmark],
      ['Objective', 'objective', Gavel],
      ['Ministry', 'ministry', Building2],
      ['Amendments', 'amendments', FileText],
    ],
    sections: [
      { title: 'Objective and Scope', fields: [['Year', 'year', Landmark], ['Objective', 'objective', Gavel], ['Ministry', 'ministry', Building2]] },
      { title: 'Key Provisions', listKey: 'keyProvisions', icon: ScrollText },
      { title: 'Significance and Amendments', fields: [['Significance', 'significance', Lightbulb], ['Amendments', 'amendments', FileText]] },
    ],
  },
  committees: {
    tone: 'committee',
    eyebrow: 'Committee',
    visualLabel: 'Committee Brief',
    introTitle: 'Committee Profile',
    factTitle: 'Committee Quick Fact',
    primaryFields: [
      ['Chairperson', 'chairperson', Users],
      ['Year', 'year', Landmark],
      ['Mandate', 'mandate', FileText],
      ['Report', 'report', ScrollText],
    ],
    sections: [
      { title: 'Mandate and Composition', fields: [['Chairperson', 'chairperson', Users], ['Year', 'year', Landmark], ['Mandate', 'mandate', FileText]] },
      { title: 'Recommendations', listKey: 'recommendations', icon: Lightbulb },
      { title: 'Report Notes', fields: [['Report', 'report', ScrollText], ['Significance', 'significance', ShieldCheck]] },
    ],
  },
  ministries: {
    tone: 'ministry',
    eyebrow: 'Ministry',
    visualLabel: 'Ministry Profile',
    introTitle: 'Institution Profile',
    factTitle: 'Governance Quick Fact',
    primaryFields: [
      ['Minister', 'minister', Users],
      ['Department', 'department', Building2],
      ['Mandate', 'mandate', FileText],
      ['Schemes', 'schemes', Layers],
    ],
    sections: [
      { title: 'Structure and Role', fields: [['Minister', 'minister', Users], ['Department', 'department', Building2], ['Mandate', 'mandate', FileText]] },
      { title: 'Schemes and Functions', fields: [['Schemes', 'schemes', Layers], ['Functions', 'functions', Gavel]] },
    ],
  },
};

function getProfile(type, category) {
  return categoryProfiles[category] || {
    tone: type === 'government' ? 'government' : 'map',
    eyebrow: titleCase(category || type),
    visualLabel: type === 'government' ? 'Reference Visual' : 'Map Visual',
    introTitle: type === 'government' ? 'Study Brief' : 'Map Profile',
    factTitle: 'UPSC Quick Fact',
    primaryFields: [
      ['Region', 'region', Compass],
      ['Significance', 'significance', Lightbulb],
    ],
    sections: [
      { title: 'Overview', fields: [['Region', 'region', Compass], ['Summary', 'summary', BookOpen], ['Significance', 'significance', Lightbulb]] },
    ],
  };
}

function getSummary(item) {
  return item.summary || item.description || item.explanation || item.significance;
}

function getRelatedSubtitle(relatedItem, category) {
  if (category === 'river-systems') {
    const lengthLabel = formatLengthKm(relatedItem.lengthKm);
    if (lengthLabel) return lengthLabel;
  }

  return relatedItem.region || relatedItem.summary || '';
}

function fieldItems(item, fields = []) {
  return fields
    .map(([label, fieldKey, icon]) => ({
      label,
      fieldKey,
      icon,
      value: displayValue(item[fieldKey], fieldKey),
    }))
    .filter((field) => hasValue(field.value));
}

export default function ContentDetailPage({
  item,
  relatedItems = [],
  type,
  baseHref,
  baseLabel,
}) {
  const profile = getProfile(type, item.category || item.section);
  const category = item.category || item.section;
  const categoryLabel = titleCase(category);
  const displayTitle = item.title?.replace('Map of ', '') || item.title;
  const summary = getSummary(item);
  const heroFields = fieldItems(item, profile.primaryFields).slice(0, 5);
  const profileFields = heroFields.length > 0
    ? heroFields
    : fieldItems({ summary }, [['Overview', 'summary', BookOpen]]);
  const sideFields = profileFields.slice(0, 6);
  const imageUrl = item.imageUrl || item.thumbnailUrl;
  const showIntroSection = !profile.hideIntroSection && profileFields.length > 0;
  const showRevisionFrame = !profile.hideRevisionFrame && sideFields.length > 0;
  const excludedSectionFields = new Set([
    ...profile.primaryFields.map(([, fieldKey]) => fieldKey),
    'upscFact',
    'region',
  ]);
  const hasSidebar = showRevisionFrame || Boolean(item.pdfUrl);
  const heroListValues = profile.heroListKey ? splitList(item[profile.heroListKey]) : [];
  const mainSections = profile.sections.filter(
    (section) => !profile.heroListKey || section.listKey !== profile.heroListKey,
  );
  const showMainColumn = showIntroSection || mainSections.length > 0;
  const relatedLimit = profile.compactLayout ? 7 : 5;
  const visibleRelatedItems = relatedItems.slice(0, relatedLimit);

  return (
    <div className={`map-detail content-detail content-detail--${profile.tone}${profile.compactLayout ? ' content-detail--compact' : ''}`}>
      <div className="map-detail__container">
        <nav className="map-detail__breadcrumb" aria-label="Breadcrumb">
          <Link href={baseHref}>{baseLabel}</Link>
          <ChevronRight size={14} />
          <Link href={`${baseHref}/${category}`}>{categoryLabel}</Link>
          <ChevronRight size={14} />
          <span className="map-detail__breadcrumb-current">{displayTitle}</span>
        </nav>

        <section className="content-detail__hero">
          <div className="content-detail__visual">
            {imageUrl ? (
              <Image
                src={imageUrl}
                alt={item.title}
                fill
                priority
                className="content-detail__image"
                sizes="(max-width: 900px) 100vw, 430px"
              />
            ) : (
              <div className="content-detail__placeholder">
                <Map size={40} strokeWidth={1.6} />
              </div>
            )}
            <span className="content-detail__visual-label">{profile.visualLabel}</span>
          </div>

          <div className="content-detail__intro">
            <span className="eyebrow content-detail__eyebrow">{profile.eyebrow}</span>
            <h1 className="map-detail__title content-detail__title">{item.title}</h1>
            {summary && <p className="content-detail__summary">{summary}</p>}

            {heroFields.length > 0 && (
              <div className="content-detail__fact-grid">
                {heroFields.map((field) => (
                  <FactTile key={field.fieldKey} {...field} />
                ))}
              </div>
            )}

            {heroListValues.length > 0 && (
              <HeroInlineList
                title={profile.heroListTitle || 'Details'}
                values={heroListValues}
                icon={Network}
              />
            )}
          </div>
        </section>

        {item.upscFact && (
          <section className="content-detail__quick-note">
            <div className="content-detail__quick-icon">
              <Lightbulb size={18} />
            </div>
            <div>
              <p className="eyebrow content-detail__quick-title">{profile.factTitle}</p>
              <p className="content-detail__quick-text">{item.upscFact}</p>
            </div>
          </section>
        )}

        {showMainColumn || hasSidebar ? (
        <div className="content-detail__body">
          <main className="content-detail__main">
            {showIntroSection && (
              <section className="map-detail__section content-detail__section">
                <div className="map-detail__section-header">
                  <h2 className="map-detail__section-title">{profile.introTitle}</h2>
                </div>
                <div className="content-detail__profile-grid">
                  {profileFields.map((field) => (
                    <InfoBlock key={field.fieldKey} {...field} />
                  ))}
                </div>
              </section>
            )}

            {mainSections.map((section) => (
              <DetailSection
                key={section.title}
                section={section}
                item={item}
                excludeFieldKeys={excludedSectionFields}
              />
            ))}
          </main>

          {hasSidebar ? (
          <aside className="content-detail__side">
            {showRevisionFrame && (
              <div className="content-detail__side-panel">
                <h2 className="eyebrow map-info__title">Revision Frame</h2>
                <div className="map-info__list">
                  {sideFields.map((field) => (
                    <InfoRow key={field.fieldKey} {...field} />
                  ))}
                </div>
              </div>
            )}

            {item.pdfUrl && (
              <a href={item.pdfUrl} className="content-detail__pdf" target="_blank" rel="noreferrer">
                <FileText size={18} />
                Open PDF Reference
              </a>
            )}
          </aside>
          ) : null}
        </div>
        ) : null}

        {visibleRelatedItems.length > 0 && (
          <section className={`map-detail__section map-related${profile.compactLayout ? ' map-related--single-row' : ''}`}>
            <div className="map-detail__section-header">
              <h2 className="map-detail__section-title">
                More in {categoryLabel}
              </h2>
            </div>
            <div className="map-related-grid">
              {visibleRelatedItems.map((relatedItem) => (
                <Link
                  key={relatedItem.id}
                  href={`${baseHref}/${relatedItem.section || relatedItem.category}/${relatedItem.slug}`}
                  className="map-related-card"
                >
                  <div className="map-related-card__image">
                    {relatedItem.thumbnailUrl || relatedItem.imageUrl ? (
                      <Image
                        src={relatedItem.thumbnailUrl || relatedItem.imageUrl}
                        alt={relatedItem.title}
                        fill
                        sizes="180px"
                      />
                    ) : null}
                  </div>
                  <div className="map-related-card__content">
                    <p className="map-related-card__title">
                      {relatedItem.title?.replace('Map of ', '')}
                    </p>
                    {(getRelatedSubtitle(relatedItem, category)) && (
                      <p className="map-related-card__region">
                        {getRelatedSubtitle(relatedItem, category)}
                      </p>
                    )}
                    {!profile.compactLayout && (
                      <span className="map-related-card__link">Open detail</span>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

function HeroInlineList({ title, values = [], icon: Icon = Network }) {
  return (
    <div className="content-detail__hero-list">
      <h2 className="content-detail__hero-list-title">{title}</h2>
      <div className="content-detail__hero-list-items">
        {values.map((value, index) => {
          const text = typeof value === 'string' ? value : value.name || value.title || value.description;
          if (!text) return null;
          return (
            <span key={`${text}-${index}`} className="content-detail__hero-list-chip">
              <Icon size={14} />
              {text}
            </span>
          );
        })}
      </div>
    </div>
  );
}

function FactTile({ icon: Icon, label, value }) {
  return (
    <div className="content-detail__fact-tile">
      <Icon size={16} />
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function InfoBlock({ icon: Icon, label, value }) {
  return (
    <div className="content-detail__info-block">
      <div className="content-detail__info-icon">
        <Icon size={17} />
      </div>
      <div>
        <p className="content-detail__info-label">{label}</p>
        <p className="content-detail__info-value">{value}</p>
      </div>
    </div>
  );
}

function InfoRow({ icon: Icon, label, value }) {
  return (
    <div className="map-info__row">
      <span className="map-info__label">
        <Icon size={15} />
        {label}
      </span>
      <span className="map-info__value">{value}</span>
    </div>
  );
}

function DetailSection({ section, item, excludeFieldKeys = new Set() }) {
  const fields = fieldItems(item, section.fields || [])
    .filter((field) => !excludeFieldKeys.has(field.fieldKey));
  const listValues = section.listKey ? splitList(item[section.listKey]) : [];
  const Icon = section.icon || BookOpen;

  if (fields.length === 0 && listValues.length === 0) return null;

  return (
    <section className="map-detail__section content-detail__section">
      <div className="map-detail__section-header">
        <h2 className="map-detail__section-title">{section.title}</h2>
      </div>

      {fields.length > 0 && (
        <div className="content-detail__section-grid">
          {fields.map((field) => (
            <InfoBlock key={field.fieldKey} {...field} />
          ))}
        </div>
      )}

      {listValues.length > 0 && (
        <div className="content-detail__list">
          {listValues.map((value, index) => {
            const text = typeof value === 'string' ? value : value.name || value.title || value.description;
            const description = typeof value === 'string' ? '' : value.description;
            if (!text) return null;
            return (
              <div key={`${text}-${index}`} className="content-detail__list-item">
                <div className="content-detail__list-icon">
                  <Icon size={16} />
                </div>
                <div>
                  <p className="content-detail__list-title">{text}</p>
                  {description && <p className="content-detail__list-description">{description}</p>}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
