import React from 'react';
import LoadingView from './LoadingView';
import ErrorView from './ErrorView';
import LastUpdatedText from './LastUpdatedText';

/** @param {{query: object}} props */
export default function QueryStatus({ query }) {
  return (
    <>
      {query.loading ? <LoadingView /> : null}
      {query.error ? (
        <ErrorView message={query.error.message} onRetry={query.refresh} />
      ) : null}
      <LastUpdatedText timestamp={query.lastUpdated} />
    </>
  );
}
