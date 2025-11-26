import {
    createBrowserRouter,
} from "react-router-dom";

import MainScreen from "./display/main";
import Login from "./display/login";
import Register from './display/register';
import Home from "./students/home";
import ShowSubchapter from "./students/subchapter_students/subchapter_lists";
import Lessons from "./students/subchapter_students/subchapter_lesson";
import Sheet from "./students/sheet_students/sheets";
import Evolution from "./students/evolution/evolution";
import Examstudent from "./students/exam_students/exam_lists";
import Favorites from "./students/subchapter_students/favorites_list";
import Dashboard from "./teachers/dashboard/dashboard";
import Subchapter from "./teachers/subchapter/subchapter";
import SubchapterExam from "./teachers/subchapter/exam/exam_list";
import AddExam from "./teachers/subchapter/exam/insert_exam";
import EditExam from "./teachers/subchapter/exam/edit_exam";
import ApprovedSheets from "./teachers/sheet/approved_sheet";
import GetSheets from "./teachers/sheet/get_sheet";
import NotificationPage from "./students/notification";
import Notification from "./teachers/notification";
import MemberList from "./teachers/member/user";
import Classroom from "./teachers/classsroom/classroom";
import StudentList from "./teachers/classsroom/student_list";
import EditProfile from "./students/profile";
import WolframAlphaQuery from './ai/WolframAlphaQuery';
import Cal from './ai/TrigCalculator';
import AIPracticeTest from './ai/AIPracticeTest';
import Knowled from './ai/knowledge-6';
import Triggraph from './ai/triggraph';
import Game from './students/game';
import ProgressDashboard from "./teachers/evolution/evolution";
import QuizPage from "./students/exam_students/exams";

// Route Guards
import ProtectedRoute from './routes/ProtectedRoute';
import PublicRoute from './routes/PublicRoute';
import RoleBasedRoute from './routes/RoleBasedRoute';

import ArticlesList from './teachers/subchapter/article/get_article'
import ArticleEdit from "./teachers/subchapter/article/article_edit";
import DefinitionInsert from "./teachers/subchapter/article/article_insert";
import ArticleDetail from "./students/article/article_detail";
import Podiumscore from "./students/article/podium_game";
import ImportStudentList from "./teachers/student-data";

const router = createBrowserRouter([
    // Public
    { path: "/cal", element: <PublicRoute><Cal /></PublicRoute> },
    { path: "/", element: <PublicRoute><MainScreen /></PublicRoute> },
    { path: "/login", element: <PublicRoute><Login /></PublicRoute> },
    { path: "/register", element: <PublicRoute><Register /></PublicRoute> },

    // Student
    { path: "/game", element: <ProtectedRoute><Game /></ProtectedRoute> },
    { path: "/score/", element: <ProtectedRoute><Podiumscore /></ProtectedRoute> },
    { path: "/ai-practice", element: <ProtectedRoute><AIPracticeTest /></ProtectedRoute> },
    { path: "/knowledge", element: <ProtectedRoute><Knowled /></ProtectedRoute> },
    { path: "/triggraph", element: <ProtectedRoute><Triggraph /></ProtectedRoute> },
    { path: "/wolframAlpha", element: <ProtectedRoute><WolframAlphaQuery /></ProtectedRoute> },
    { path: "/home", element: <ProtectedRoute><Home /></ProtectedRoute> },
    { path: "/subchapter", element: <ProtectedRoute><ShowSubchapter /></ProtectedRoute> },
    { path: "/lessons", element: <ProtectedRoute><Lessons /></ProtectedRoute> },
    { path: "/article/:subchapterId", element: <ProtectedRoute><ArticleDetail /></ProtectedRoute> },
    { path: "/exams", element: <ProtectedRoute><Examstudent /></ProtectedRoute> },
    { path: "/pretest", element: <ProtectedRoute><QuizPage mode="pretest" /></ProtectedRoute> },
    { path: "/posttest", element: <ProtectedRoute><QuizPage mode="posttest" /></ProtectedRoute> },
    { path: "/notifications", element: <ProtectedRoute><NotificationPage /></ProtectedRoute> },
    { path: "/evolution", element: <ProtectedRoute><Evolution /></ProtectedRoute> },
    { path: "/editprofile", element: <ProtectedRoute><EditProfile /></ProtectedRoute> },
    { path: "/sheet", element: <ProtectedRoute><Sheet /></ProtectedRoute> },
    { path: "/favorites", element: <ProtectedRoute><Favorites /></ProtectedRoute> },

    // Teacher
    { path: "teacher/dashboard", element: <RoleBasedRoute allowedRoles={['teacher', 'admin']}><Dashboard /></RoleBasedRoute> },
    { path: "teacher/member", element: <RoleBasedRoute allowedRoles={['admin', 'teacher']}><MemberList /></RoleBasedRoute> },
    { path: "teacher/sheet", element: <RoleBasedRoute allowedRoles={['teacher']}><GetSheets /></RoleBasedRoute> },
    { path: "teacher/approved", element: <RoleBasedRoute allowedRoles={['teacher']}><ApprovedSheets /></RoleBasedRoute> },
    { path: "teacher/evolution", element: <RoleBasedRoute allowedRoles={['teacher', 'admin']}><ProgressDashboard /></RoleBasedRoute> },
    { path: "teacher/notification", element: <RoleBasedRoute allowedRoles={['teacher', 'admin']}><Notification /></RoleBasedRoute> },
    { path: "teacher/subchapter", element: <RoleBasedRoute allowedRoles={['teacher']}><Subchapter /></RoleBasedRoute> },
    { path: "teacher/article", element: <RoleBasedRoute allowedRoles={['teacher']}><ArticlesList /></RoleBasedRoute> },
    { path: "teacher/article/insert/", element: <RoleBasedRoute allowedRoles={['teacher']}><DefinitionInsert /></RoleBasedRoute> },
    { path: "teacher/article/edit/", element: <RoleBasedRoute allowedRoles={['teacher']}><ArticleEdit /></RoleBasedRoute> },
    { path: "teacher/exams", element: <RoleBasedRoute allowedRoles={['teacher']}><SubchapterExam /></RoleBasedRoute> },
    { path: "teacher/addExam/:subchapterID", element: <RoleBasedRoute allowedRoles={['teacher']}><AddExam /></RoleBasedRoute> },
    { path: "teacher/editExam/:subchapterID", element: <RoleBasedRoute allowedRoles={['teacher']}><EditExam /></RoleBasedRoute> },
    { path: "teacher/student-data", element: <RoleBasedRoute allowedRoles={['teacher', 'admin']}><ImportStudentList /></RoleBasedRoute> },
    { path: "teacher/classroom", element: <RoleBasedRoute allowedRoles={['teacher', 'admin']}><Classroom /></RoleBasedRoute> },
    { path: "teacher/classroom/member", element: <RoleBasedRoute allowedRoles={['teacher', 'admin']}><StudentList /></RoleBasedRoute> },
], {
    future: {
        v7_startTransition: true,
    },
});

export default router;
