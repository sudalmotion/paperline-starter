import { feature } from "topojson-client";
import type { Feature, FeatureCollection, Geometry } from "geojson";
import type { GeometryCollection, Topology } from "topojson-specification";
import world from "world-atlas/countries-50m.json";

// Natural Earth 1:50m countries (public domain) via world-atlas.
const topology = world as unknown as Topology<{ countries: GeometryCollection<{ name: string }> }>;
export const countries = feature(topology, topology.objects.countries) as FeatureCollection<Geometry, { name: string }>;

const byName = new Map(countries.features.map((f) => [f.properties.name.toLowerCase(), f]));

export const findCountry = (name: string): Feature<Geometry, { name: string }> | undefined => byName.get(name.toLowerCase());
