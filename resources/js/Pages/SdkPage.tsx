import {
  CdnDeliverySection,
  CoreSection,
  FakerSection,
  ImageOptionsSection,
  ImagesSection,
  InstallationSection,
  NearestSizingSection,
  ProvidersSection,
  SdkIntro,
} from '../Components/SdkSections';

import { PageProps } from '../types';
import { SdkHeader } from '../Components/PageHeader';
import { SdkLayout } from '../Components/SdkDocs';

export default function SdkPage({ appName, baseUrl, config }: PageProps) {
  return (
    <>
      <SdkHeader
        appName={appName}
        baseUrl={baseUrl}
        logoUrl={config.app.url + '/logo.png'}
      />

      <SdkLayout appName={appName} baseUrl={baseUrl}>
        <SdkIntro appName={appName} />
        <InstallationSection />
        <CoreSection baseUrl={baseUrl} />
        <ImageOptionsSection />
        <ProvidersSection baseUrl={baseUrl} />
        <NearestSizingSection />
        <FakerSection baseUrl={baseUrl} />
        <ImagesSection />
        <CdnDeliverySection baseUrl={baseUrl} />
      </SdkLayout>
    </>
  );
}
