export interface CountryTelevoteSum {
    country: string;
    televoteSum: number;
    placement: number;
}

export interface TelevoteAggregation {
    [country: string]: number;
}