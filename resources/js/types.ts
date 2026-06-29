import type { AppConfig } from '@arkstack/common'

export type CategoriesProps = {
    baseUrl: string;
    categories: string[];
    loadedCategories: Record<string, boolean>;
    hiddenCategories: Record<string, boolean>;
    setLoadedCategories: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
    setHiddenCategories: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
    prefillCategory: (category: string) => void;
};

export type RouteStyle = 'picsum' | 'toneflix' | 'id' | 'category' | 'seed';

export type MosaicTile = {
    className?: string;
    width: number;
    height: number;
    route: 'random' | 'seed' | 'filter' | 'category';
    seed?: string;
    filter?: string;
    category?: string;
    alt: string;
    caption: string;
    pill: string;
};

export type PlaygroundProps = {
    baseUrl: string;
    categories: string[];
    filterChips: string[];
    fonts: Record<string, string>;

    pgBase: string;
    setPgBase: (value: string) => void;

    pgStyle: RouteStyle;
    setPgStyle: (value: RouteStyle) => void;

    pgW: string;
    setPgW: (value: string) => void;

    pgH: string;
    setPgH: (value: string) => void;

    pgFmt: string;
    setPgFmt: (value: string) => void;

    pgCat: string;
    setPgCat: (value: string) => void;

    pgId: string;
    setPgId: (value: string) => void;

    pgSeed: string;
    setPgSeed: (value: string) => void;

    pgText: string;
    setPgText: (value: string) => void;

    pgFont: string;
    setPgFont: (value: string) => void;

    activeFilters: string[];
    toggleFilter: (filter: string) => void;

    previewUrl: string;
    previewFailed: boolean;
    setPreviewFailed: (value: boolean) => void;

    copyLabel: string;
    copyPreviewUrl: () => void;
};

export type SamplesProps = {
    baseUrl: string;
    mosaicTiles: MosaicTile[];
    reloadNonce: number;
    spinning: boolean;
    reloadSamples: () => void;
    buildTileUrl: (baseUrl: string, tile: MosaicTile, reloadNonce: number) => string;
    loadedMosaic: Record<number, boolean>;
    hiddenMosaic: Record<number, boolean>;
    setLoadedMosaic: React.Dispatch<React.SetStateAction<Record<number, boolean>>>;
    setHiddenMosaic: React.Dispatch<React.SetStateAction<Record<number, boolean>>>;
};

export type PageProps = {
    appName: string;
    baseUrl: string;
    logoUrl: string;
    config: { app: AppConfig };
    categories: string[];
    fonts: Record<string, string>;
};