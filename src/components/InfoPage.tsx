export default function InfoPage() {
  return (
    <div className="h-full overflow-y-auto">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-8 sm:py-10">

        {/* ── Sources ── */}
        <section className="mb-10 sm:mb-14">
          <div className="mb-4">
            <div className="flex items-center gap-3">
              <div className="w-1.5 self-stretch -skew-x-12 rounded-full bg-blue-500 shadow-lg shadow-blue-500/30" />
              <h2 className="text-lg font-black uppercase tracking-wide text-white sm:text-xl">
                Źródła danych
              </h2>
            </div>
            <div className="mt-3 h-px bg-gradient-to-r from-blue-500/40 via-blue-500/10 to-transparent" />
          </div>

          <p className="mb-3 text-sm leading-relaxed text-gray-400">
            System opiera się na danych dostarczanych przez Zarząd Transportu Publicznego
            w Krakowie, udostępnionych zgodnie ze specyfikacją GTFS (Static & Realtime).
          </p>

          <div className="space-y-1.5">
            <p className="text-sm text-gray-400">
              <span className="font-semibold text-gray-300">Dane ZTP:</span>{' '}
              <a
                href="https://gtfs.ztp.krakow.pl"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 transition hover:text-blue-300 hover:underline"
              >
                gtfs.ztp.krakow.pl
              </a>
            </p>
            <p className="text-sm text-gray-400">
              <span className="font-semibold text-gray-300">GTFS:</span>{' '}
              <a
                href="https://gtfs.org/documentation/overview/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 transition hover:text-blue-300 hover:underline"
              >
                gtfs.org/documentation/overview
              </a>
            </p>
          </div>
        </section>

        {/* ── Code ── */}
        <section className="mb-10 sm:mb-14">
          <div className="mb-4">
            <div className="flex items-center gap-3">
              <div className="w-1.5 self-stretch -skew-x-12 rounded-full bg-blue-500 shadow-lg shadow-blue-500/30" />
              <h2 className="text-lg font-black uppercase tracking-wide text-white sm:text-xl">
                Kod projektu
              </h2>
            </div>
            <div className="mt-3 h-px bg-gradient-to-r from-blue-500/40 via-blue-500/10 to-transparent" />
          </div>

          <p className="mb-3 text-sm leading-relaxed text-gray-400">
            Całość powstała jako luźny projekt do portfolio. Czy da się to zrobić lepiej?
            Myślę, że na pewno. Jeśli masz pomysł na refactor lub po prostu chcesz przejrzeć
            kod backendu, to poniżej udostępniam link do GitHuba.
          </p>

          <p className="text-sm text-gray-400">
            <span className="font-semibold text-gray-300">GitHub:</span>{' '}
            <a
              href="https://github.com/grzechuzz/KRK_TRANSIT"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 transition hover:text-blue-300 hover:underline"
            >
              github.com/grzechuzz/KRK_TRANSIT
            </a>
          </p>
        </section>

        {/* ── Privacy ── */}
        <section>
          <div className="mb-4">
            <div className="flex items-center gap-3">
              <div className="w-1.5 self-stretch -skew-x-12 rounded-full bg-blue-500 shadow-lg shadow-blue-500/30" />
              <h2 className="text-lg font-black uppercase tracking-wide text-white sm:text-xl">
                Polityka prywatności
              </h2>
            </div>
            <div className="mt-3 h-px bg-gradient-to-r from-blue-500/40 via-blue-500/10 to-transparent" />
          </div>

          <div className="space-y-4 text-sm leading-relaxed text-gray-400">
            <div>
              <h3 className="mb-1 font-semibold text-gray-300">Administrator</h3>
              <p>
                Administratorem serwisu KRK Transit jest jego twórca. Kontakt:{' '}
                <a
                  href="mailto:krktransit@gmail.com"
                  className="text-blue-400 transition hover:text-blue-300 hover:underline"
                >
                  krktransit@gmail.com
                </a>
              </p>
            </div>

            <div>
              <h3 className="mb-1 font-semibold text-gray-300">Jakie dane przetwarzamy</h3>
              <p>
                Serwis nie wymaga rejestracji, logowania ani nie wykorzystuje plików cookies.
                Przetwarzamy wyłącznie dane techniczne, które są automatycznie przekazywane
                podczas korzystania ze strony:
              </p>
              <ul className="mt-2 list-inside list-disc space-y-1 text-gray-500">
                <li>Adres IP</li>
                <li>Typ przeglądarki (user-agent)</li>
                <li>Data i godzina zapytania</li>
              </ul>
            </div>

            <div>
              <h3 className="mb-1 font-semibold text-gray-300">Cel i czas przetwarzania</h3>
              <p>
                Dane techniczne przetwarzane są wyłącznie w celu zapewnienia prawidłowego
                działania serwisu, ochrony przed nadużyciami oraz diagnostyki błędów.
                Podstawa prawna: prawnie uzasadniony interes administratora (art. 6 ust. 1
                lit. f RODO). Logi serwera są przechowywane tymczasowo i usuwane
                automatycznie w procesie rotacji logów.
              </p>
            </div>

            <div>
              <h3 className="mb-1 font-semibold text-gray-300">Usługi zewnętrzne</h3>
              <p>Serwis korzysta z następujących usług zewnętrznych:</p>
              <ul className="mt-2 list-inside list-disc space-y-1 text-gray-500">
                <li>
                  <span className="text-gray-400">Google Fonts</span> — dostarczanie
                  czcionek. Google może otrzymywać adres IP użytkownika.
                </li>
                <li>
                  <span className="text-gray-400">CARTO</span> — wyświetlanie kafelków
                  mapy. CARTO może otrzymywać adres IP użytkownika.
                </li>
              </ul>
            </div>

            <div>
              <h3 className="mb-1 font-semibold text-gray-300">Wyłączenie odpowiedzialności</h3>
              <p>
                Prezentowane dane o pozycjach pojazdów, opóźnieniach i rozkładach jazdy mają
                charakter wyłącznie informacyjny. Mogą zawierać nieścisłości, opóźnienia
                lub błędy wynikające ze źródeł danych. Administrator nie ponosi
                odpowiedzialności za decyzje podjęte na podstawie informacji
                prezentowanych w serwisie.
              </p>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}
