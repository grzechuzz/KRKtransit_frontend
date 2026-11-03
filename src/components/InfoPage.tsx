import { useI18n } from '../i18n-core';

export default function InfoPage() {
  const { t } = useI18n();

  return (
    <div className="h-full overflow-y-auto">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-8 sm:py-10">

        {/* Sources */}
        <section className="mb-10 sm:mb-14">
          <div className="mb-4">
            <div className="flex items-center gap-3">
              <div className="w-1.5 self-stretch -skew-x-12 rounded-full bg-blue-500 shadow-lg shadow-blue-500/30" />
              <h2 className="text-lg font-black uppercase tracking-wide text-ink sm:text-xl">
                {t.info.sourcesTitle}
              </h2>
            </div>
            <div className="mt-3 h-px bg-gradient-to-r from-blue-500/40 via-blue-500/10 to-transparent" />
          </div>

          <p className="mb-3 text-sm leading-relaxed text-muted">
            {t.info.sourcesBody}
          </p>

          <div className="space-y-1.5">
            <p className="text-sm text-muted">
              <span className="font-semibold text-body">{t.info.ztpData}:</span>{' '}
              <a
                href="https://gtfs.ztp.krakow.pl"
                target="_blank"
                rel="noopener noreferrer"
                className="text-accent transition hover:text-accent-strong hover:underline"
              >
                gtfs.ztp.krakow.pl
              </a>
            </p>
            <p className="text-sm text-muted">
              <span className="font-semibold text-body">GTFS:</span>{' '}
              <a
                href="https://gtfs.org/documentation/overview/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-accent transition hover:text-accent-strong hover:underline"
              >
                gtfs.org/documentation/overview
              </a>
            </p>
          </div>
        </section>

        {/* Code */}
        <section className="mb-10 sm:mb-14">
          <div className="mb-4">
            <div className="flex items-center gap-3">
              <div className="w-1.5 self-stretch -skew-x-12 rounded-full bg-blue-500 shadow-lg shadow-blue-500/30" />
              <h2 className="text-lg font-black uppercase tracking-wide text-ink sm:text-xl">
                {t.info.projectCodeTitle}
              </h2>
            </div>
            <div className="mt-3 h-px bg-gradient-to-r from-blue-500/40 via-blue-500/10 to-transparent" />
          </div>

          <p className="mb-3 text-sm leading-relaxed text-muted">
            {t.info.projectCodeBody}
          </p>

          <p className="text-sm text-muted">
            <span className="font-semibold text-body">GitHub:</span>{' '}
            <a
              href="https://github.com/grzechuzz/KRK_TRANSIT"
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent transition hover:text-accent-strong hover:underline"
            >
              github.com/grzechuzz/KRK_TRANSIT
            </a>
          </p>
        </section>

        {/* Privacy */}
        <section>
          <div className="mb-4">
            <div className="flex items-center gap-3">
              <div className="w-1.5 self-stretch -skew-x-12 rounded-full bg-blue-500 shadow-lg shadow-blue-500/30" />
              <h2 className="text-lg font-black uppercase tracking-wide text-ink sm:text-xl">
                {t.info.privacyTitle}
              </h2>
            </div>
            <div className="mt-3 h-px bg-gradient-to-r from-blue-500/40 via-blue-500/10 to-transparent" />
          </div>

          <div className="space-y-4 text-sm leading-relaxed text-muted">
            <div>
              <h3 className="mb-1 font-semibold text-body">{t.info.administratorTitle}</h3>
              <p>
                {t.info.administratorBody}{' '}
                <a
                  href="mailto:krktransit@gmail.com"
                  className="text-accent transition hover:text-accent-strong hover:underline"
                >
                  krktransit@gmail.com
                </a>
              </p>
            </div>

            <div>
              <h3 className="mb-1 font-semibold text-body">{t.info.processedDataTitle}</h3>
              <p>{t.info.processedDataBody}</p>
              <ul className="mt-2 list-inside list-disc space-y-1 text-subtle">
                <li>{t.info.ipAddress}</li>
                <li>{t.info.userAgent}</li>
                <li>{t.info.requestTime}</li>
              </ul>
            </div>

            <div>
              <h3 className="mb-1 font-semibold text-body">{t.info.processingPurposeTitle}</h3>
              <p>{t.info.processingPurposeBody}</p>
            </div>

            <div>
              <h3 className="mb-1 font-semibold text-body">{t.info.externalServicesTitle}</h3>
              <p>{t.info.externalServicesBody}</p>
              <ul className="mt-2 list-inside list-disc space-y-1 text-subtle">
                <li>
                  <span className="text-muted">Google Fonts</span> — {t.info.googleFonts}
                </li>
                <li>
                  <span className="text-muted">CARTO</span> — {t.info.carto}
                </li>
              </ul>
            </div>

            <div>
              <h3 className="mb-1 font-semibold text-body">{t.info.disclaimerTitle}</h3>
              <p>{t.info.disclaimerBody}</p>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}
