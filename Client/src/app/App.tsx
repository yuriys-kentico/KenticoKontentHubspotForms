import React, { lazy, Suspense } from 'react';
import { boundary, useError } from 'react-boundary';

import { useLocalStorage } from '@rehooks/local-storage';

import { InvalidUsage } from './InvalidUsage';
import { Loading } from './Loading';
import { LocalStorageKeys } from './LocalStorageKeys';

const HubSpotForms = lazy(() => import('./element/HubSpotForms').then((module) => ({ default: module.HubSpotForms })));
const Error = lazy(() => import('./Error').then((module) => ({ default: module.Error })));

export const App = boundary(() => {
  const [error, info] = useError();

  const [, setHubSpotCode] = useLocalStorage<string>(LocalStorageKeys.Code);

  if (error || info) {
    return <Error stack={`${error && error.stack}${info && info.componentStack}`} />;
  }

  const hubspotCode = new URLSearchParams(global.location.search).get('code');

  if (hubspotCode) {
    setHubSpotCode(hubspotCode);

    global.close();

    return null;
  }

  const invalidUsage = global.self === global.top;

  return (
    <Suspense fallback={<Loading />}>
      {invalidUsage && <InvalidUsage />}
      {!invalidUsage && <HubSpotForms />}
    </Suspense>
  );
});
