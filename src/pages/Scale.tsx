import { ArrowLeft, ArrowRight } from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import ScaleWorkbench from '../features/scale/ScaleWorkbench';
import { WORKLOADS, type Workload } from '../features/scale/game/model';
import { scaleSaveKey } from '../features/scale/storage';
import '../features/scale/styles.css';

export default function Scale() {
  const { user } = useAuth();
  const [params, setParams] = useSearchParams();
  const candidate = params.get('project');
  const scenario: Workload =
    candidate && Object.hasOwn(WORKLOADS, candidate) ? (candidate as Workload) : 'saas';
  const choosing = !candidate || !Object.hasOwn(WORKLOADS, candidate);
  const saveKey = scaleSaveKey(user?.id, scenario);
  return (
    <div className="scale-workbench">
      {choosing ? (
        <main className="project-picker-page" id="main-content">
          <Link className="return-to-play" to="/play">
            <ArrowLeft size={15} /> Back to Play
          </Link>
          <header className="project-picker-heading">
            <span className="project-kicker">SCALE / PROJECTS</span>
            <h1>What are you building?</h1>
            <p>
              Start with a tiny SaaS. Work up to a social network or an AI gateway. Different
              workloads demand different decisions.
            </p>
          </header>
          <div className="project-options">
            {(Object.entries(WORKLOADS) as [Workload, (typeof WORKLOADS)[Workload]][]).map(
              ([id, project]) => (
                <button
                  className="project-option"
                  key={id}
                  onClick={() => {
                    setParams({ project: id });
                  }}
                >
                  <div className="project-difficulty" data-level={project.difficulty}>
                    {project.difficulty}
                  </div>
                  <div className="project-option-copy">
                    <h2>{project.title}</h2>
                    <span className="project-inspiration">{project.inspiration}</span>
                    <p>{project.description}</p>
                    <span className="project-assumptions">
                      {Math.round(project.read * 100)}% reads · {project.appMs}ms app work · +
                      {Math.round(project.growth * 100)}% growth/day
                    </span>
                  </div>
                  <ArrowRight size={20} aria-hidden="true" />
                </button>
              )
            )}
          </div>
          <p className="project-picker-note">
            Each project keeps a separate company on this device. Choosing one starts or resumes its
            run. These are simplified workload challenges; the expert scenarios do not simulate a
            full social graph, model routing, or provider infrastructure.
          </p>
        </main>
      ) : (
        <ScaleWorkbench
          key={saveKey}
          saveKey={saveKey}
          scenario={scenario}
          chooseProject={() => setParams({})}
        />
      )}
    </div>
  );
}
