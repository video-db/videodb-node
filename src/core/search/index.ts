import {
  ApiPath,
  SemanticSearchDefaultValues,
  KeywordSearchDefaultValues,
} from '@/constants';
import type { Search } from '@/interfaces/core';
import type { SearchType } from '@/types/search';
import { IndexTypeValues, SearchTypeValues } from '@/core/config';
import type { SearchResponse } from '@/types/response';
import type {
  KeywordCollectionSearch,
  KeywordVideoSearch,
  SemanticCollectionSearch,
  SemanticVideoSearch,
  SceneCollectionSearch,
  SceneVideoSearch,
} from '@/types/search';
import { HttpClient } from '@/utils/httpClient';
import { SearchResult } from './searchResult';

const { video, search, collection } = ApiPath;

class SceneSearch implements Search<SceneVideoSearch, SceneCollectionSearch> {
  #vhttp: HttpClient;
  constructor(http: HttpClient) {
    this.#vhttp = http;
  }

  private getRequestData = (data: SceneVideoSearch | SceneCollectionSearch) => {
    return {
      index_type: IndexTypeValues.scene,
      query: data.query,
      score_threshold:
        data.scoreThreshold ?? SemanticSearchDefaultValues.scoreThreshold,
      result_threshold:
        data.resultThreshold ?? SemanticSearchDefaultValues.resultThreshold,
    };
  };

  searchInsideVideo = async (data: SceneVideoSearch) => {
    const reqData = this.getRequestData(data);
    const res = await this.#vhttp.post<SearchResponse, typeof reqData>(
      [video, data.videoId, search],
      reqData
    );
    return new SearchResult(this.#vhttp, res.data);
  };

  searchInsideCollection = async (_data: SceneCollectionSearch) => {
    throw new Error(
      'Method not implemented. Scene search is not supported for Collection'
    );
  };
}

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
      index_type: SearchTypeValues.semantic,
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

class KeywordSearch
  implements Search<KeywordVideoSearch, KeywordCollectionSearch>
{
  #vhttp: HttpClient;
  constructor(http: HttpClient) {
    this.#vhttp = http;
  }

  private getRequestData = (
    data: KeywordVideoSearch | KeywordCollectionSearch
  ) => {
    return {
      index_type: SearchTypeValues.keyword,
      query: data.query,
      score_threshold:
        data.scoreThreshold ?? KeywordSearchDefaultValues.scoreThreshold,
      result_threshold:
        data.resultThreshold ?? KeywordSearchDefaultValues.resultThreshold,
    };
  };

  searchInsideVideo = async (data: KeywordVideoSearch) => {
    const reqData = this.getRequestData(data);
    const res = await this.#vhttp.post<SearchResponse, typeof reqData>(
      [video, data.videoId, search],
      reqData
    );
    return new SearchResult(this.#vhttp, res.data);
  };

  searchInsideCollection = async (data: KeywordCollectionSearch) => {
    throw new Error(
      'Method not implemented. Keyword search is not supported for Collection'
    );
  };
}

const searchType = {
  semantic: SemanticSearch,
  keyword: KeywordSearch,
  scene: SceneSearch,
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
