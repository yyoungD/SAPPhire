import { ROUTES } from '../../constanjs/routes.js';
import { navigate } from '../../utils/authUtils.js';

const footerSections = [
  {
    title: 'PLATFORM',
    links: [
      { label: 'Jobs', path: ROUTES.JOBS },
      { label: 'AI Matches', path: ROUTES.AI_EVALUATION },
      { label: 'Resume', path: ROUTES.RESUMES },
      { label: 'Applications', path: ROUTES.MY_APPLICATIONS },
    ],
  },
  {
    title: 'COMPANY',
    links: [
      { label: 'For Employers', path: ROUTES.COMPANY_MY_PAGE },
      { label: 'Talent Solutions', path: ROUTES.TALENT_SEARCH },
      { label: 'Contact', path: ROUTES.HOME },
    ],
  },
  {
    title: 'RESOURCES',
    links: [
      { label: 'Help Center', path: ROUTES.HOME },
      { label: 'Terms of Service', path: ROUTES.CONSENT },
      { label: 'Privacy Policy', path: ROUTES.CONSENT },
    ],
  },
];

export default function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="site-footer-inner">
        <section className="footer-brand">
          <h2>SAPPhire</h2>
          <p>AI 기반 SAP 커리어 & 채용 플랫폼. SAP 전문가와 기업을 데이터 기반 AI 매칭으로 연결합니다.</p>
          <div className="footer-badges" aria-label="SAPPhire highlights">
            <span>
              <i className="badge-dot badge-dot-dark" />
              Trusted by SAP Professionals
            </span>
            <span>
              <i className="badge-dot badge-dot-blue" />
              AI-powered Career Intelligence
            </span>
          </div>
        </section>

        <nav className="footer-nav" aria-label="Footer navigation">
          {footerSections.map((section) => (
            <section className="footer-section" key={section.title}>
              <h3>{section.title}</h3>
              <ul>
                {section.links.map((link) => (
                  <li key={link.label}>
                    <button type="button" onClick={() => navigate(link.path)}>
                      {link.label}
                    </button>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </nav>

        <div className="footer-bottom">
          <p>© 2024 SAPPhire. AI-powered Career Intelligence. Trusted by SAP Professionals.</p>
          <div className="footer-social" aria-label="Social links">
            <button type="button" aria-label="SAPPhire community">
              in
            </button>
            <button type="button" aria-label="SAPPhire updates">
              X
            </button>
            <button type="button" aria-label="SAPPhire network">
              @
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
