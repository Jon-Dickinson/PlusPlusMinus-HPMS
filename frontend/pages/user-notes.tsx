import React, { useEffect, useState } from 'react';
import MainTemplate from '../templates/MainTemplate';
import styled from 'styled-components';
import { useRouter } from 'next/router';
import { CityProvider } from '../components/organisms/CityContext';
import Header from '../components/molecules/Header';
import StatsPanel from '../components/organisms/StatsPanel';
import GlobalNav from '../components/molecules/GlobalNav';
import BuildingLogPanel from '../components/organisms/BuildingLogPanel';
import dynamic from 'next/dynamic';

const EditorPlaceholder = styled.div`
  background: #111D3A;
  border-radius: 6px;
  min-height: 420px;
  padding: 1rem;
  color: #fff;
  width: 100%;
  margin-top: 10px;
  margin-right: 50px;
  border: 1px solid #ffffff;
  .ql-container {
    background: #111D3A;
    color: #fff;
    border: none;
  }
  .ql-editor {
    min-height: 320px;
    color: #fff;
  }
`;

// Dynamically import react-quill to avoid SSR issues
const ReactQuill = dynamic(() => import('react-quill'), { ssr: false });

// icon handled by GlobalNav

export default function UserNotes() {
  const router = useRouter();
  const isActive = (path: string) => router.pathname === path;

  const [notes, setNotes] = useState<string>('');
  const [quillLoaded, setQuillLoaded] = useState(false);

  useEffect(() => {
    // Load Quill styles dynamically (client-side only)
    import('react-quill/dist/quill.snow.css')
      .catch(() => {
        /* ignore if package not installed yet; developer should install react-quill */
      })
      .finally(() => setQuillLoaded(true));
  }, []);

  const modules = {
    toolbar: [
      ['bold', 'italic', 'underline'],
      [{ list: 'ordered' }, { list: 'bullet' }],
      ['link', 'image'],
    ],
  };

  return (
    <MainTemplate>
      <GlobalNav />

      <ColWrapper>
        <Header />
        <RowWrapper>
          <CityProvider>
            <ResourceColumn>
              <GridHeader>
                <h3>Mayor: Paul Sims</h3>
                <h2>City Name, Country</h2>
              </GridHeader>

              <StatsPanel />
            </ResourceColumn>

            <MainGridArea>
              <GridContainer>
                <EditorPlaceholder>
                  {quillLoaded && ReactQuill ? (
                    // @ts-ignore - react-quill types may not be present in the project
                    <ReactQuill value={notes} onChange={setNotes} modules={modules} theme="snow" />
                  ) : (
                    <div>
                      <h3>Notes Editor</h3>
                      <p>
                        Loading editor... If you haven't installed <code>react-quill</code>,
                        run <code>npm install react-quill</code> in the frontend folder.
                      </p>
                    </div>
                  )}
                </EditorPlaceholder>
              </GridContainer>
            </MainGridArea>
          
         
          </CityProvider>
        </RowWrapper>
      </ColWrapper>
    </MainTemplate>
  );
}

/* Reuse layout styled definitions from dashboard */
const RowWrapper = styled.div`
  position: relative;
  display: inline-flex;
  flex-direction: row;
  width: 100%;
  height: 100%;
`;

const ColWrapper = styled.div`
  position: relative;
  display: inline-flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
`;

const Sidebar = styled.div`
  width: 80px;
  min-width: 80px;
  background: #111d3a;
  box-shadow: 2px 0 5px rgba(0, 0, 0, 0.5);
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 1rem 0;
`;

const NavIcons = styled.div`
  display: flex;
  flex-direction: column;
  gap: 25px;
  padding-top: 5px;
`;

const ResourceColumn = styled.div`
  position: relative;
  width: 100%;
  max-width: 360px;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

/* ==== MAIN GRID AREA ==== */
const MainGridArea = styled.div`
  margin-top: 72px;
  display: flex;
  flex-direction: column;
  width: 100%;
`;

const GridHeader = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  padding-left: 10px;

  h2 {
    font-size: 12px;
    margin: 0;
    color: #ffffff;
    font-weight: 400;
  }

  h3 {
    margin: 0;
    font-size: 18px;
    color: #ffffff;
    font-weight: 500;
  }
`;

const GridContainer = styled.div`
  display: flex;
  align-items: flex-start;
  flex: 1;
`;

const InfoColumn = styled.div`
  width: 100%;
  max-width: 240px;
  min-width: 240px;
  display: flex;
  flex-direction: column;
  padding: 80px 20px;
  gap: 1.5rem;
`;

const QualityBox = styled.div`
  padding: 1rem;
  text-align: center;
  border-radius: 5px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.24);
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  background-color: #192748;

  h3 {
    color: #ffffff;
    font-weight: 400;
  }
  span {
    font-size: 2rem;
    font-weight: 500;
    color: #ffcc00;
  }
`;

const BuildingLog = styled.div`
  border-radius: 5px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.24);
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  background-color: #192748;
  padding: 1rem;
  color: #ffffff;
  h4 {
    margin-bottom: 10px;
    margin-top: 0;
    font-weight: 400;
  }
  ul {
    list-style: none;
    padding: 0;
    margin: 0;
  }
  li {
    font-size: 13px;
    padding: 0.25rem 0;
  }
`;