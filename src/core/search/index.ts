import {
  ApiPath,
  DefaultSearchType,
  SemanticSearchDefaultValues,
} from '@/constants';
import type { Search } from '@/interfaces/core';
import type { SearchType } from '@/types/index';
import type { SearchResponse } from '@/types/response';
import type {
  SemanticCollectionSearch,
  SemanticVideoSearch,
} from '@/types/utils';
import { HttpClient } from '@/utils/httpClient';
import { SearchResult } from './searchResult';

const { video, search, collection } = ApiPath;

class SemanticSearch
  implements Search<SemanticVideoSearch, SemanticCollectionSearch>
{
  #vhttp: HttpClient;
  constructor(http: HttpClient) {
    this.#vhttp = http;
  }

  private getRequestData = (
    data: SemanticVideoSearch | SemanticCollectionSearch
  ) => {
    return {
      type: DefaultSearchType,
      query: data.query,
      score_threshold:
        data.scoreThreshold ?? SemanticSearchDefaultValues.scoreThreshold,
      result_threshold:
        data.resultThreshold ?? SemanticSearchDefaultValues.resultThreshold,
    };
  };

  searchInsideVideo = async (data: SemanticVideoSearch) => {
    const reqData = this.getRequestData(data);
    const res = await this.#vhttp.post<SearchResponse, typeof reqData>(
      [video, data.videoId, search],
      reqData
    );
    return new SearchResult(this.#vhttp, res.data);
  };

  searchInsideCollection = async (data: SemanticCollectionSearch) => {
    const reqData = this.getRequestData(data);
    const res = await this.#vhttp.post<SearchResponse, typeof reqData>(
      [collection, data.collectionId, search],
      reqData
    );
    return new SearchResult(this.#vhttp, res.data);
  };
}

const searchType = {
  semantic: SemanticSearch,
};

export class SearchFactory {
  private vhttp: HttpClient;
  constructor(http: HttpClient) {
    this.vhttp = http;
  }
  getSearch(type: SearchType) {
    return new searchType[type](this.vhttp);
  }
}
