export default function Om() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Om NaboPlan</h1>
      <p className="text-gray-500 mb-10">
        Et studentprosjekt fra NTNU EiT TDT4857 — Eksperter i Team 2025.
      </p>

      <section className="mb-10">
        <h2 className="text-xl font-semibold text-gray-900 mb-3">Hva er NaboPlan?</h2>
        <p className="text-gray-700 leading-relaxed">
          NaboPlan er en digital tjeneste som gjør det enklere for innbyggere, kommuneansatte,
          politikere og organisasjoner å delta i og forstå norske planprosesser. Tjenesten
          bruker kunstig intelligens (Claude API fra Anthropic) til å forklare planforslag
          på vanlig norsk og hjelpe brukere å formulere høringsmerknader.
        </p>
      </section>

      <section className="mb-10">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Hvem er tjenesten for?</h2>
        <div className="space-y-3">
          {[
            { ikon: '🏠', tittel: 'Innbyggere og naboer', beskr: 'Som ønsker å forstå hva planene betyr for nabolaget og delta med egne meninger.' },
            { ikon: '🏛️', tittel: 'Kommuneansatte', beskr: 'Som ønsker bedre oversikt over innspill fra innbyggere.' },
            { ikon: '⚖️', tittel: 'Politikere', beskr: 'Som trenger rask innsikt i hva innbyggerne er opptatt av.' },
            { ikon: '🌳', tittel: 'Organisasjoner', beskr: 'Velforeninger, miljøgrupper og andre som ønsker å organisere felles merknader.' },
            { ikon: '📐', tittel: 'Planleggere og arkitekter', beskr: 'Som ønsker å forstå hva innbyggerne faktisk er opptatt av.' },
          ].map((a) => (
            <div key={a.tittel} className="flex gap-3 p-4 bg-gray-50 rounded-lg">
              <span className="text-2xl" aria-hidden="true">{a.ikon}</span>
              <div>
                <p className="font-medium text-gray-900">{a.tittel}</p>
                <p className="text-sm text-gray-600">{a.beskr}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="mb-10">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Slik fungerer planprosessen</h2>
        <ol className="space-y-3">
          {[
            'Kommunen varsler oppstart av planarbeid.',
            'Planforslaget utarbeides av plankonsulent eller kommunen selv.',
            'Planforslaget legges ut på høring i minst 6 uker.',
            'Alle kan sende inn merknader i høringsperioden.',
            'Kommunen behandler merknader og kan revidere planen.',
            'Planen vedtas av bystyret/kommunestyret.',
            'Planen kan klages inn til Statsforvalteren innen 3 uker.',
          ].map((steg, i) => (
            <li key={i} className="flex gap-3">
              <span className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center font-bold flex-shrink-0 mt-0.5">
                {i + 1}
              </span>
              <p className="text-sm text-gray-700">{steg}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="mb-10">
        <h2 className="text-xl font-semibold text-gray-900 mb-3">Personvern og databehandling</h2>
        <div className="bg-gray-50 rounded-xl p-5 space-y-2 text-sm text-gray-700">
          <p>E-postadresser samles kun inn i to tilfeller:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Varslingspåmelding: e-post med koordinater lagres for å sende varsel om nye planer.</li>
            <li>Merknadbekreftelse: valgfritt, kun for å sende deg en kopi av merknaden.</li>
          </ul>
          <p className="mt-2">Ingen andre persondata samles inn. Chatbotsamtaler kan logges for kvalitetssikring, men uten personidentifisering.</p>
        </div>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-gray-900 mb-3">Kontakt</h2>
        <p className="text-gray-700 text-sm">
          Dette er et prototype-prosjekt fra NTNU EiT TDT4857. For spørsmål eller tilbakemeldinger,
          ta kontakt via NTNU-instituttet for Bygg og miljøteknikk.
        </p>
      </section>
    </div>
  )
}
