export type SourceRecord = {
  title: string;
  author: string;
  url: string;
  revised: string;
  type: string;
  whyUseful: string;
  supportedModules: string[];
  accessStatus: string;
  checkedAt: string;
};
const checkedAt = "2026-10-16";
export const sourceCatalog: SourceRecord[] = [
  {
    title: "Classical Logic",
    author: "Stewart Shapiro and Teresa Kouri Kissel",
    url: "https://plato.stanford.edu/entries/logic-classical/",
    revised: "2026-06-17",
    type: "Academic reference",
    whyUseful: "Explains deductive consequence and formal validity.",
    supportedModules: ["arguments-and-reasons"],
    accessStatus: "Open",
    checkedAt,
  },
  {
    title: "The Analysis of Knowledge",
    author: "Jonathan Ichikawa and Matthias Steup",
    url: "https://plato.stanford.edu/entries/knowledge-analysis/",
    revised: "2026-01-21",
    type: "Academic reference",
    whyUseful: "Covers justified true belief and Gettier cases.",
    supportedModules: ["knowledge-and-evidence"],
    accessStatus: "Open",
    checkedAt,
  },
  {
    title: "Virtue Ethics",
    author: "Rosalind Hursthouse and Glen Pettigrove",
    url: "https://plato.stanford.edu/entries/ethics-virtue/",
    revised: "2026-05-03",
    type: "Academic reference",
    whyUseful:
      "Introduces character-based ethical reasoning and comparisons with other theories.",
    supportedModules: ["ethical-reasoning"],
    accessStatus: "Open",
    checkedAt,
  },
  {
    title: "Consciousness",
    author: "Robert Van Gulick",
    url: "https://plato.stanford.edu/entries/consciousness/",
    revised: "2014-01-14",
    type: "Academic reference",
    whyUseful:
      "Surveys experience, physicalist approaches, and explanatory challenges.",
    supportedModules: ["mind-and-consciousness"],
    accessStatus: "Open",
    checkedAt,
  },
  {
    title: "Free Will",
    author: "Timothy O’Connor and Christopher Franklin",
    url: "https://plato.stanford.edu/entries/freewill/",
    revised: "2022-11-03",
    type: "Academic reference",
    whyUseful:
      "Maps compatibilist and incompatibilist accounts of free action.",
    supportedModules: ["free-will-and-responsibility"],
    accessStatus: "Open",
    checkedAt,
  },
  {
    title: "Justice",
    author: "David Miller",
    url: "https://plato.stanford.edu/entries/justice/",
    revised: "2026-01-19",
    type: "Academic reference",
    whyUseful:
      "Introduces distributive justice and competing standards of fairness.",
    supportedModules: ["justice-and-institutions"],
    accessStatus: "Open",
    checkedAt,
  },
  {
    title: "Theory and Observation in Science",
    author: "Nora Mills Boyd and James Bogen",
    url: "https://plato.stanford.edu/entries/science-theory-observation/",
    revised: "2026-01-12",
    type: "Academic reference",
    whyUseful: "Examines how observations connect to scientific claims.",
    supportedModules: ["evidence-and-hypotheses"],
    accessStatus: "Open",
    checkedAt,
  },
  {
    title: "NIST Technical Note 1297",
    author: "National Institute of Standards and Technology",
    url: "https://www.nist.gov/pml/nist-technical-note-1297",
    revised: "Date not confirmed",
    type: "Technical guide",
    whyUseful: "Introduces uncertainty in measurement and how it is expressed.",
    supportedModules: ["measurement-and-error"],
    accessStatus: "Open",
    checkedAt,
  },
  {
    title: "Probabilistic Causation",
    author: "Christopher Hitchcock",
    url: "https://plato.stanford.edu/entries/causation-probabilistic/",
    revised: "2018-03-09",
    type: "Academic reference",
    whyUseful: "Examines causal claims when outcomes are uncertain.",
    supportedModules: ["causation-and-experiments"],
    accessStatus: "Open",
    checkedAt,
  },
  {
    title: "Models in Science",
    author: "Roman Frigg and Stephan Hartmann",
    url: "https://plato.stanford.edu/entries/models-science/",
    revised: "2025-04-02",
    type: "Academic reference",
    whyUseful:
      "Explains what scientific models represent and how they are used.",
    supportedModules: ["models-and-explanation"],
    accessStatus: "Open",
    checkedAt,
  },
  {
    title: "Interpretations of Probability",
    author: "Alan Hájek",
    url: "https://plato.stanford.edu/entries/probability-interpret/",
    revised: "2023-11-16",
    type: "Academic reference",
    whyUseful: "Clarifies distinct meanings of probability and uncertainty.",
    supportedModules: ["uncertainty-and-probability"],
    accessStatus: "Open",
    checkedAt,
  },
  {
    title: "Scientific Objectivity",
    author: "Julian Reiss and Jan Sprenger",
    url: "https://plato.stanford.edu/entries/scientific-objectivity/",
    revised: "2020-10-30",
    type: "Academic reference",
    whyUseful:
      "Discusses objectivity, values, and disagreement in scientific practice.",
    supportedModules: ["scientific-disagreement"],
    accessStatus: "Open",
    checkedAt,
  },
];
