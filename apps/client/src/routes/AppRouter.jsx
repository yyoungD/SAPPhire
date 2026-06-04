import { useEffect, useMemo, useState } from 'react';
import { ROUTES } from '../constanjs/routes.js';
import ProtectedRoute from './ProtectedRoute.jsx';
import RoleRedirect from './RoleRedirect.jsx';
import LandingPage from '../pages/landing/LandingPage.jsx';
import LoginPage from '../pages/auth/LoginPage.jsx';
import SignupPage from '../pages/auth/SignupPage.jsx';
import ConsentPage from '../pages/auth/ConsentPage.jsx';
import OAuthCallbackPage from '../pages/auth/OAuthCallbackPage.jsx';
import UserMyPage from '../pages/personal/mypage/UserMyPage.jsx';
import UserUpdatePage from '../pages/personal/mypage/UserUpdatePage.jsx';
import ProfilePage from '../pages/personal/profile/ProfilePage.jsx';
import ProfileUpdatePage from '../pages/personal/profile/ProfileUpdatePage.jsx';
import AiEvaluationPage from '../pages/personal/profile/AiEvaluationPage.jsx';
import ResumeListPage from '../pages/personal/resumes/ResumeListPage.jsx';
import ResumeCreatePage from '../pages/personal/resumes/ResumeCreatePage.jsx';
import ResumeDetailPage from '../pages/personal/resumes/ResumeDetailPage.jsx';
import ResumeUpdatePage from '../pages/personal/resumes/ResumeUpdatePage.jsx';
import MyApplicationListPage from '../pages/personal/applications/MyApplicationListPage.jsx';
import MyApplicationDetailPage from '../pages/personal/applications/MyApplicationDetailPage.jsx';
import PositionOfferReceivedListPage from '../pages/personal/positionOffers/PositionOfferReceivedListPage.jsx';
import PositionOfferReceivedDetailPage from '../pages/personal/positionOffers/PositionOfferReceivedDetailPage.jsx';
import JobListPage from '../pages/jobs/JobListPage.jsx';
import JobDetailPage from '../pages/jobs/JobDetailPage.jsx';
import JobApplyPage from '../pages/jobs/JobApplyPage.jsx';
import JobBookmarkPage from '../pages/jobs/JobBookmarkPage.jsx';
import CompanyMyPage from '../pages/company/mypage/CompanyMyPage.jsx';
import CompanyProfilePage from '../pages/company/profile/CompanyProfilePage.jsx';
import CompanyProfileUpdatePage from '../pages/company/profile/CompanyProfileUpdatePage.jsx';
import CompanyJobListPage from '../pages/company/jobs/CompanyJobListPage.jsx';
import CompanyJobCreatePage from '../pages/company/jobs/CompanyJobCreatePage.jsx';
import CompanyJobDetailPage from '../pages/company/jobs/CompanyJobDetailPage.jsx';
import CompanyJobUpdatePage from '../pages/company/jobs/CompanyJobUpdatePage.jsx';
import ApplicationListPage from '../pages/company/applications/ApplicationListPage.jsx';
import ApplicationDetailPage from '../pages/company/applications/ApplicationDetailPage.jsx';
import TalenjsearchPage from '../pages/company/resumes/TalenjsearchPage.jsx';
import CompanyResumeDetailPage from '../pages/company/resumes/CompanyResumeDetailPage.jsx';
import PositionOfferListPage from '../pages/company/positionOffers/PositionOfferListPage.jsx';
import PositionOfferCreatePage from '../pages/company/positionOffers/PositionOfferCreatePage.jsx';
import PositionOfferDetailPage from '../pages/company/positionOffers/PositionOfferDetailPage.jsx';
import ProfileReviewCreatePage from '../pages/company/reviews/ProfileReviewCreatePage.jsx';
import AdminLoginPage from '../pages/admin/AdminLoginPage.jsx';
import AdminDashboardPage from '../pages/admin/AdminDashboardPage.jsx';
import AdminUserManagePage from '../pages/admin/users/AdminUserManagePage.jsx';
import AdminUserDetailPage from '../pages/admin/users/AdminUserDetailPage.jsx';
import AdminCompanyManagePage from '../pages/admin/companies/AdminCompanyManagePage.jsx';
import AdminCompanyDetailPage from '../pages/admin/companies/AdminCompanyDetailPage.jsx';
import AdminJobManagePage from '../pages/admin/jobs/AdminJobManagePage.jsx';
import AdminJobDetailPage from '../pages/admin/jobs/AdminJobDetailPage.jsx';
import AdminApplicationManagePage from '../pages/admin/applications/AdminApplicationManagePage.jsx';
import AdminPositionOfferManagePage from '../pages/admin/positionOffers/AdminPositionOfferManagePage.jsx';
import AdminReportManagePage from '../pages/admin/reporjs/AdminReportManagePage.jsx';
import NotFoundPage from '../pages/errors/NotFoundPage.jsx';
import SiteFooter from '../componenjs/layout/SiteFooter.jsx';

function guarded(Component, roles) {
  return (
    <ProtectedRoute roles={roles}>
      <Component />
    </ProtectedRoute>
  );
}

function withFooter(page) {
  return (
    <>
      {page}
      <SiteFooter />
    </>
  );
}

export default function AppRouter() {
  const [path, setPath] = useState(window.location.pathname);

  useEffect(() => {
    const onChange = () => setPath(window.location.pathname);
    window.addEventListener('popstate', onChange);
    return () => window.removeEventListener('popstate', onChange);
  }, []);

  const routes = useMemo(
    () => ({
      [ROUTES.HOME]: <LandingPage />,
      [ROUTES.LOGIN]: <LoginPage />,
      [ROUTES.SIGNUP]: <SignupPage />,
      [ROUTES.CONSENT]: <ConsentPage />,
      [ROUTES.OAUTH_CALLBACK]: <OAuthCallbackPage />,
      '/redirect': <RoleRedirect />,
      [ROUTES.USER_MY_PAGE]: guarded(UserMyPage, ['PERSONAL']),
      [ROUTES.USER_UPDATE]: guarded(UserUpdatePage, ['PERSONAL']),
      [ROUTES.PROFILE]: guarded(ProfilePage, ['PERSONAL']),
      [ROUTES.PROFILE_UPDATE]: guarded(ProfileUpdatePage, ['PERSONAL']),
      [ROUTES.AI_EVALUATION]: guarded(AiEvaluationPage, ['PERSONAL']),
      [ROUTES.RESUMES]: guarded(ResumeListPage, ['PERSONAL']),
      [ROUTES.RESUME_CREATE]: guarded(ResumeCreatePage, ['PERSONAL']),
      [ROUTES.RESUME_DETAIL]: guarded(ResumeDetailPage, ['PERSONAL']),
      [ROUTES.RESUME_UPDATE]: guarded(ResumeUpdatePage, ['PERSONAL']),
      [ROUTES.MY_APPLICATIONS]: guarded(MyApplicationListPage, ['PERSONAL']),
      [ROUTES.MY_APPLICATION_DETAIL]: guarded(MyApplicationDetailPage, ['PERSONAL']),
      [ROUTES.RECEIVED_OFFERS]: guarded(PositionOfferReceivedListPage, ['PERSONAL']),
      [ROUTES.RECEIVED_OFFER_DETAIL]: guarded(PositionOfferReceivedDetailPage, ['PERSONAL']),
      [ROUTES.JOBS]: <JobListPage />,
      [ROUTES.JOB_DETAIL]: <JobDetailPage />,
      [ROUTES.JOB_APPLY]: guarded(JobApplyPage, ['PERSONAL']),
      [ROUTES.JOB_BOOKMARKS]: guarded(JobBookmarkPage, ['PERSONAL']),
      [ROUTES.COMPANY_MY_PAGE]: guarded(CompanyMyPage, ['COMPANY']),
      [ROUTES.COMPANY_PROFILE]: guarded(CompanyProfilePage, ['COMPANY']),
      [ROUTES.COMPANY_PROFILE_UPDATE]: guarded(CompanyProfileUpdatePage, ['COMPANY']),
      [ROUTES.COMPANY_JOBS]: guarded(CompanyJobListPage, ['COMPANY']),
      [ROUTES.COMPANY_JOB_CREATE]: guarded(CompanyJobCreatePage, ['COMPANY']),
      [ROUTES.COMPANY_JOB_DETAIL]: guarded(CompanyJobDetailPage, ['COMPANY']),
      [ROUTES.COMPANY_JOB_UPDATE]: guarded(CompanyJobUpdatePage, ['COMPANY']),
      [ROUTES.COMPANY_APPLICATIONS]: guarded(ApplicationListPage, ['COMPANY']),
      [ROUTES.COMPANY_APPLICATION_DETAIL]: guarded(ApplicationDetailPage, ['COMPANY']),
      [ROUTES.TALENT_SEARCH]: guarded(TalenjsearchPage, ['COMPANY']),
      [ROUTES.COMPANY_RESUME_DETAIL]: guarded(CompanyResumeDetailPage, ['COMPANY']),
      [ROUTES.POSITION_OFFERS]: guarded(PositionOfferListPage, ['COMPANY']),
      [ROUTES.POSITION_OFFER_CREATE]: guarded(PositionOfferCreatePage, ['COMPANY']),
      [ROUTES.POSITION_OFFER_DETAIL]: guarded(PositionOfferDetailPage, ['COMPANY']),
      [ROUTES.PROFILE_REVIEW_CREATE]: guarded(ProfileReviewCreatePage, ['COMPANY']),
      [ROUTES.ADMIN_LOGIN]: <AdminLoginPage />,
      [ROUTES.ADMIN_DASHBOARD]: guarded(AdminDashboardPage, ['ADMIN']),
      [ROUTES.ADMIN_USERS]: guarded(AdminUserManagePage, ['ADMIN']),
      [ROUTES.ADMIN_USER_DETAIL]: guarded(AdminUserDetailPage, ['ADMIN']),
      [ROUTES.ADMIN_COMPANIES]: guarded(AdminCompanyManagePage, ['ADMIN']),
      [ROUTES.ADMIN_COMPANY_DETAIL]: guarded(AdminCompanyDetailPage, ['ADMIN']),
      [ROUTES.ADMIN_JOBS]: guarded(AdminJobManagePage, ['ADMIN']),
      [ROUTES.ADMIN_JOB_DETAIL]: guarded(AdminJobDetailPage, ['ADMIN']),
      [ROUTES.ADMIN_APPLICATIONS]: guarded(AdminApplicationManagePage, ['ADMIN']),
      [ROUTES.ADMIN_POSITION_OFFERS]: guarded(AdminPositionOfferManagePage, ['ADMIN']),
      [ROUTES.ADMIN_REPORTS]: guarded(AdminReportManagePage, ['ADMIN']),
    }),
    [],
  );

  const page = routes[path] || <NotFoundPage />;
  const footerHiddenPaths = [ROUTES.LOGIN, ROUTES.SIGNUP];

  return footerHiddenPaths.includes(path) ? page : withFooter(page);
}
