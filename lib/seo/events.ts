import type { Event, Venue } from '@/types/database';

import { getSiteUrl, siteName } from './site';

type GeoCoordinatesSchema = {
  '@type': 'GeoCoordinates';
  latitude: number;
  longitude: number;
};

type PostalAddressSchema = {
  '@type': 'PostalAddress';
  streetAddress: string;
  addressLocality: string;
  addressRegion: string;
  postalCode: string;
  addressCountry?: string;
};

type PlaceSchema = {
  '@type': 'Place';
  name: string;
  address?: PostalAddressSchema;
  geo?: GeoCoordinatesSchema;
  url?: string;
};

type EventSchema = {
  '@type': 'Event';
  name: string;
  startDate: string;
  eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode';
  eventStatus: 'https://schema.org/EventScheduled';
  location: PlaceSchema;
  url: string;
  description?: string;
  image?: string;
};

type ListItemSchema = {
  '@type': 'ListItem';
  position: number;
  item: EventSchema;
};

type ItemListSchema = {
  '@context': 'https://schema.org';
  '@type': 'ItemList';
  name: string;
  itemListElement: ListItemSchema[];
};

const buildLocationSchema = (venue?: Venue): PlaceSchema => {
  if (!venue) {
    return {
      '@type': 'Place',
      name: 'Venue to be announced',
    };
  }

  const location: PlaceSchema = {
    '@type': 'Place',
    name: venue.name,
    address: {
      '@type': 'PostalAddress',
      streetAddress: venue.address_street,
      addressLocality: venue.address_city,
      addressRegion: venue.address_state,
      postalCode: venue.address_zip,
      ...(venue.address_country ? { addressCountry: venue.address_country } : {}),
    },
  };

  if (venue.website_url) {
    location.url = venue.website_url;
  }

  if (venue.latitude !== null && venue.longitude !== null) {
    location.geo = {
      '@type': 'GeoCoordinates',
      latitude: venue.latitude,
      longitude: venue.longitude,
    };
  }

  return location;
};

export const buildEventItemListSchema = (
  events: Event[],
  venues: Venue[],
): ItemListSchema | null => {
  if (events.length === 0) {
    return null;
  }

  const baseUrl = getSiteUrl();
  const venueById = new Map(venues.map((venue) => [venue.id, venue]));

  const itemListElement: ListItemSchema[] = events.map((event, index): ListItemSchema => {
    const venue = venueById.get(event.venue_id);
    const item: EventSchema = {
      '@type': 'Event',
      name: event.title,
      startDate: event.start_datetime,
      eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
      eventStatus: 'https://schema.org/EventScheduled',
      location: buildLocationSchema(venue),
      url: event.official_website_url ?? `${baseUrl}/events`,
      ...(event.description ? { description: event.description } : {}),
      ...(event.flyer_image_url ? { image: event.flyer_image_url } : {}),
    };

    return {
      '@type': 'ListItem',
      position: index + 1,
      item,
    };
  });

  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: `${siteName} Events`,
    itemListElement,
  };
};
