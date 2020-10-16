import moment, { Moment } from 'moment';
import React, { FC, Fragment, useEffect, useRef, useState } from 'react';
import { useAsyncEffect } from 'use-async-effect';
import wretch from 'wretch';

import { createStyles, makeStyles } from '@material-ui/styles';
import useLocalStorage from '@rehooks/local-storage';

import { kenticoKontent } from '../../appSettings.json';
import { element as elementTerms } from '../../terms.en-us.json';
import { loadModule } from '../../utilities/modules';
import { Loading } from '../Loading';
import { LocalStorageKeys } from '../LocalStorageKeys';
import { IHubSpotFormsConfig } from '../shared/IHubSpotFormsConfig';
import { IHubSpotFormsResponse } from '../shared/IHubSpotFormsResponse';
import { IContext } from '../shared/models/customElement/IContext';
import { ICustomElement } from '../shared/models/customElement/ICustomElement';
import { IHubSpotForm } from '../shared/models/hubspot/IHubSpotForm';

// Expose access to Kentico custom element API
declare const CustomElement: ICustomElement<IHubSpotFormsConfig>;

const useStyles = makeStyles(() =>
  createStyles({
    row: { display: 'flex', flexDirection: 'row', margin: '4px 0' },
    fullWidthCell: { flex: 1 },
    select: {
      border: 'none',
      color: '#4c4d52',
    },
    form: { display: 'table' },
    formRow: { display: 'table-row' },
    label: { display: 'table-cell' },
    input: { display: 'table-cell' },
  })
);

const redirectUri = global.location.href;

export const HubSpotForms: FC = () => {
  const styles = useStyles();

  const [available, setAvailable] = useState(false);
  const [enabled, setEnabled] = useState(true);
  const [customElementConfig, setCustomElementConfig] = useState<IHubSpotFormsConfig | null>(null);
  const [customElementContext, setCustomElementContext] = useState<IContext | null>(null);
  const [loading, setLoading] = useState(false);

  const [hubspotCode] = useLocalStorage<string>(LocalStorageKeys.Code);
  const [hubSpotCodeExpiration] = useLocalStorage<Moment | null>(LocalStorageKeys.CodeExpiration);
  const [hubspotForms, setHubSpotForms] = useState<IHubSpotForm[]>();
  const [selectedForm, setSelectedForm] = useState<IHubSpotForm>();
  const [showSelectedForm, setShowSelectedForm] = useState(true);

  const [error, setError] = useState<string>();

  const elementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!available) {
      const initCustomElement = (element: ICustomElement<IHubSpotFormsConfig>, context: IContext) => {
        setAvailable(true);
        setElementEnabled(!element.disabled);
        setCustomElementConfig(element.config);
        setCustomElementContext(context);

        CustomElement.onDisabledChanged((disabled) => setElementEnabled(!disabled));
      };

      const setElementEnabled = (enabled: boolean) => {
        setEnabled(enabled);
      };

      loadModule(kenticoKontent.customElementScriptEndpoint, () => CustomElement.init(initCustomElement));
    }
  }, [available]);

  useEffect(() => {
    if (available && elementRef.current) {
      let totalHeight = elementRef.current.scrollHeight;

      CustomElement.setHeight(totalHeight);
    }
  });

  useEffect(() => {
    const now = moment();

    if (
      available &&
      customElementConfig &&
      customElementContext &&
      (hubspotCode === undefined || (moment(hubSpotCodeExpiration) || now).diff(now) < 0)
    ) {
      setLoading(true);

      try {
        global.open(
          `https://app.hubspot.com/oauth/authorize?scope=contacts%20forms&client_id=${customElementConfig.hubspotClientId}&redirect_uri=${redirectUri}`,
          undefined,
          'width=900,height500'
        );
      } catch (error) {
        setError(error.message);
      }
    }
  }, [available, customElementConfig, customElementContext, hubspotCode, hubSpotCodeExpiration]);

  useAsyncEffect(async () => {
    if (available && customElementConfig && customElementContext && hubspotCode) {
      const request = wretch(`${customElementConfig.hubspotFormsEndpoint}`)
        .post({
          clientId: customElementConfig.hubspotClientId,
          redirectUri: redirectUri,
          code: hubspotCode,
        })
        .json<IHubSpotFormsResponse>();

      try {
        const response = await request;

        setHubSpotForms(response.forms);
      } catch (error) {
        setError(error.message);
      }

      setLoading(false);
    }
  }, [available, customElementConfig, customElementContext, hubspotCode]);

  return (
    <div>
      {available && (
        <div ref={elementRef}>
          {loading && <Loading />}
          {error && <div>{error}</div>}
          {error === undefined && enabled && hubspotForms && (
            <>
              <div className={styles.row}>
                <div className={styles.fullWidthCell}>
                  <p>{elementTerms.enabledDescription}</p>
                </div>
              </div>
              <div className={styles.row}>
                <div className={styles.fullWidthCell}>
                  <select
                    className={styles.select}
                    value={selectedForm?.guid}
                    onChange={(event) => {
                      if (event.target.value) {
                        setSelectedForm(hubspotForms.find((form) => form.guid === event.target.value));
                        setShowSelectedForm(true);
                      } else {
                        setSelectedForm(undefined);
                      }
                    }}
                  >
                    <option value=''>{elementTerms.chooseForm}</option>
                    {hubspotForms.map((form) => (
                      <option key={form.guid} value={form.guid}>
                        {form.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              {selectedForm && (
                <div className={styles.row}>
                  <div className={styles.fullWidthCell}>
                    <p>{elementTerms.previewExplanation}</p>
                  </div>
                </div>
              )}
              <div className={styles.row}>
                <div className={styles.fullWidthCell}>
                  {selectedForm && (
                    <div className={styles.form}>
                      <h4>{selectedForm.name}</h4>
                      {showSelectedForm && (
                        <>
                          {selectedForm.formFieldGroups.map((formFieldGroup, index) => (
                            <Fragment key={index}>
                              {formFieldGroup.fields.map((field, index) => {
                                return (
                                  <label key={index} className={styles.formRow}>
                                    <p className={styles.label}>{field.label}</p>
                                    <input
                                      className={styles.input}
                                      name={field.name}
                                      type={field.type}
                                      placeholder={field.placeholder}
                                      required={field.required}
                                      defaultValue={field.defaultValue}
                                    />
                                    <p>{field.description}</p>
                                  </label>
                                );
                              })}
                            </Fragment>
                          ))}
                          <input
                            type='submit'
                            value={selectedForm.submitText}
                            onClick={() => setShowSelectedForm(false)}
                          />
                        </>
                      )}
                      {!showSelectedForm && (
                        <>
                          <p>{selectedForm.inlineMessage}</p>
                          <br />
                          <button onClick={() => setShowSelectedForm(true)}>{elementTerms.reset}</button>
                        </>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
          {error === undefined && !enabled && (
            <div className='content-item-element__guidelines'>
              <p>{elementTerms.disabledDescription}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
