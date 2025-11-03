import React, { useEffect, useState } from 'react';
import MainTemplate from '../templates/MainTemplate';
import GlobalNav from '../components/molecules/GlobalNav';
import Header from '../components/molecules/Header';
import styled from 'styled-components';
import { useAuth } from '../context/AuthContext';

type Endpoint = {
	path: string;
	method: string;
	summary?: string;
	description?: string;
};

export default function ApiTestPage() {
	const [endpoints, setEndpoints] = useState<Endpoint[]>([]);
	const [responses, setResponses] = useState<Record<string, any>>({});
	const [bodies, setBodies] = useState<Record<string, string>>({});
	const [filter, setFilter] = useState('');
	const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
	const { token } = useAuth();

	useEffect(() => {
		let mounted = true;
		fetch('/api/docs/json')
			.then((r) => r.json())
			.then((data) => {
				if (!mounted) return;
				const flattened: Endpoint[] = Object.entries(data.paths || {}).flatMap(([path, ops]: any) =>
					Object.entries(ops).map(([method, def]: any) => ({
						path,
						method: method.toUpperCase(),
						summary: def.summary,
						description: def.description,
					})),
				);
				setEndpoints(flattened);
			})
			.catch((err) => console.error('Failed to load swagger.json:', err));
		return () => {
			mounted = false;
		};
	}, []);

	const [showAll, setShowAll] = useState(false);
	const [paramInputs, setParamInputs] = useState<Record<string, string>>({ userId: '2', category: 'residential' });

	async function runApi(ep: Endpoint) {
		try {
			const rawBody = bodies[ep.path];
			const parsedBody = rawBody ? JSON.parse(rawBody) : undefined;
			const headers: Record<string, string> = { 'Content-Type': 'application/json' };
			if (token) headers['Authorization'] = `Bearer ${token}`;

			const res = await fetch(ep.path, {
				method: ep.method as any,
				headers,
				body: ['POST', 'PUT', 'PATCH'].includes(ep.method) ? JSON.stringify(parsedBody) : undefined,
			});

			const text = await res.text();
			let json: any = null;
			try {
				json = text ? JSON.parse(text) : null;
			} catch (e) {
				json = { text };
			}

			setResponses((p) => ({ ...p, [ep.path + '|' + ep.method]: { status: res.status, data: json } }));
		} catch (err: any) {
			setResponses((p) => ({ ...p, [ep.path + '|' + ep.method]: { error: err.message } }));
		}
	}

	async function runRaw(method: string, path: string, body?: any) {
		try {
			const headers: Record<string, string> = { 'Content-Type': 'application/json' };
			if (token) headers['Authorization'] = `Bearer ${token}`;
			const res = await fetch(path, {
				method: method as any,
				headers,
				body: ['POST', 'PUT', 'PATCH'].includes(method) ? JSON.stringify(body) : undefined,
			});
			const text = await res.text();
			let json: any = null;
			try { json = text ? JSON.parse(text) : null; } catch (e) { json = { text }; }
			setResponses((p) => ({ ...p, [path + '|' + method]: { status: res.status, data: json } }));
		} catch (err: any) {
			setResponses((p) => ({ ...p, [path + '|' + method]: { error: err.message } }));
		}
	}

	return (
		<MainTemplate>
			<GlobalNav />

			<ColWrapper>
				<Header />

				<Container>
					<Title>API Test Console</Title>
 
					<QuickActions>
						<h3>Quick API Calls</h3>
						<ActionList>
						 

							<ActionRow>
								<ActionInfo>
									<Method method={'GET'}>GET</Method>
									<Code>/api/users</Code>
								</ActionInfo>
								<div>
									<ActionDesc>get all mayors (admin only)</ActionDesc>
									<ActionButton onClick={async () => { await runRaw('GET', '/api/users'); }}>Run</ActionButton>
								</div>
							</ActionRow>

							<ActionRow>
								<ActionInfo>
									<Method method={'GET'}>GET</Method>
									<Code>/api/city/:userId</Code>
								</ActionInfo>
								<div>
									<ParamInput value={paramInputs.userId} onChange={(e) => setParamInputs(s => ({ ...s, userId: e.target.value }))} />
									<ActionDesc>get city data (grid + stats)</ActionDesc>
									<ActionButton onClick={async () => { const path = `/api/city/${paramInputs.userId}`; await runRaw('GET', path); }}>Run</ActionButton>
								</div>
							</ActionRow>

						 
							<ActionRow>
								<ActionInfo>
									<Method method={'GET'}>GET</Method>
									<Code>/api/notes/:userId</Code>
								</ActionInfo>
								<div>
									<ParamInput value={paramInputs.userId} onChange={(e) => setParamInputs(s => ({ ...s, userId: e.target.value }))} />
									<ActionDesc>get user notes</ActionDesc>
									<ActionButton onClick={async () => { const path = `/api/notes/${paramInputs.userId}`; await runRaw('GET', path); }}>Run</ActionButton>
								</div>
							</ActionRow>

					 

							<ActionRow>
								<ActionInfo>
									<Method method={'GET'}>GET</Method>
									<Code>/api/buildings/:type</Code>
								</ActionInfo>
								<div>
									<ParamInput value={paramInputs.category} onChange={(e) => setParamInputs(s => ({ ...s, category: e.target.value }))} />
									<ActionDesc>get building analysis info</ActionDesc>
									<ActionButton onClick={async () => { const path = `/api/buildings/${paramInputs.category}`; await runRaw('GET', path); }}>Run</ActionButton>
								</div>
							</ActionRow>
						</ActionList>
					</QuickActions>

			 
				</Container>
			</ColWrapper>
		</MainTemplate>
	);
}

const ColWrapper = styled.div`
	position: relative;
	display: inline-flex;
	flex-direction: column;
	width: 100%;
	height: 100%;
	overflow-y: auto;
`;

const Container = styled.div`
	padding: 24px;
`;

const Title = styled.h3`
	color: #ffffff;
	margin: 0 0 12px 0;
`;

const FilterInput = styled.input`
	padding: 0.6rem 1rem;
	border: 1px solid #ccc;
	border-radius: 6px;
	font-size: 1rem;
	width: 100%;
	margin-bottom: 12px;
`;

const List = styled.div`
	display: flex;
	flex-direction: column;
	gap: 12px;
	max-height: calc(100vh - 220px);
	overflow: auto;
`;

const Card = styled.div`
	background: #fff;
	border: 1px solid #ddd;
	border-radius: 8px;
	padding: 12px;
	box-shadow: 0 2px 4px rgba(0, 0, 0, 0.04);
`;

const Top = styled.div`
	display: flex;
	align-items: center;
	gap: 12px;
`;

const Method = styled.span<{ method?: string }>`
	font-weight: 700;
	color: #fff;
	padding: 4px 8px;
	border-radius: 4px;
	background: ${(p) => (p.method === 'GET' ? '#2fbf4a' : p.method === 'POST' ? '#007bff' : p.method === 'PUT' ? '#f79e1b' : '#ee3e36')};
`;

const Path = styled.span`
	font-family: monospace;
	color: #0366d6;
`;

const Summary = styled.p`
	margin: 8px 0;
	color: #444;
`;

const ReqBody = styled.textarea`
	width: 100%;
	border-radius: 6px;
	border: 1px solid #ddd;
	font-family: monospace;
	padding: 8px;
`;

const Row = styled.div`
	display: flex;
	gap: 8px;
	margin-top: 8px;
`;

const Run = styled.button`
	background: #007bff;
	color: white;
	border: none;
	padding: 6px 12px;
	border-radius: 6px;
	cursor: pointer;
`;

const Small = styled.button`
	background: transparent;
	color: #666;
	border: none;
	cursor: pointer;
`;

const Response = styled.div`
	margin-top: 8px;
	background: #0f1720;
	color: #d1fae5;
	border-radius: 6px;
	padding: 10px;
	max-height: 300px;
	overflow: auto;
	pre {
		margin: 0;
		white-space: pre-wrap;
	}
`;

const TwoColumn = styled.div`
	display: grid;
	grid-template-columns: 360px 1fr;
	gap: 16px;
`;

const SideList = styled.div`
	background: #fff;
	border: 1px solid #e6e6e6;
	border-radius: 8px;
	padding: 8px;
	max-height: calc(100vh - 260px);
	overflow: auto;
`;

const SearchBox = styled.input`
	width: 100%;
	padding: 8px;
	border: 1px solid #ddd;
	border-radius: 6px;
	margin-bottom: 8px;
`;

const ListItem = styled.div<{ selected?: boolean }>`
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 8px;
	border-radius: 6px;
	background: ${(p) => (p.selected ? '#eef6ff' : 'transparent')};
	&:hover {
		background: #f7f9fc;
	}
`;

const Left = styled.div`
	display: flex;
	align-items: center;
	gap: 8px;
`;

const SmallPath = styled.span`
	font-family: monospace;
	font-size: 0.85rem;
	color: #333;
`;

const SelectButton = styled.button`
	background: #0b5fff;
	color: white;
	border: none;
	padding: 6px 10px;
	border-radius: 6px;
	cursor: pointer;
`;

const Details = styled.div`
	background: #fff;
	border: 1px solid #e6e6e6;
	border-radius: 8px;
	padding: 12px;
	min-height: 160px;
`;

const Empty = styled.div`
	color: #666;
	padding: 32px;
`;

const AllPanel = styled.div`
	margin-bottom: 12px;
	background: #fff;
	border: 1px solid #e6e6e6;
	border-radius: 8px;
	padding: 8px 12px;
`;

const PanelHeader = styled.div`
	display: flex;
	align-items: center;
	justify-content: space-between;
	h3 { margin: 0; }
`;

const CopyAll = styled.button`
	background: transparent;
	border: 1px solid #d0d7ff;
	color: #0b5fff;
	padding: 6px 8px;
	border-radius: 6px;
	margin-right: 8px;
	cursor: pointer;
`;

const Toggle = styled.button`
	background: transparent;
	border: none;
	color: #666;
	cursor: pointer;
`;

const EndpointsList = styled.div`
	margin-top: 8px;
	max-height: 180px;
	overflow: auto;
	display: flex;
	flex-direction: column;
	gap: 6px;
`;

const EndpointRow = styled.div`
	display: flex;
	align-items: center;
	gap: 8px;
`;

const QuickActions = styled.div`
	margin-top: 12px;
	background: #fff;
	border: 1px solid #e6e6e6;
	border-radius: 8px;
	padding: 12px;
`;

const ActionList = styled.div`
	display: flex;
	flex-direction: column;
	gap: 10px;
`;

const ActionRow = styled.div`
	display: flex;
	align-items: center;
	justify-content: space-between;
	gap: 12px;
	padding: 8px;
	border-radius: 6px;
	background: #fafafa;
`;

const ActionInfo = styled.div`
	display: flex;
	align-items: center;
	gap: 12px;
`;

const Code = styled.code`
	font-family: monospace;
	color: #333;
`;

const ActionDesc = styled.div`
	color: #444;
	margin-bottom: 6px;
`;

const ActionButton = styled.button`
	background: #0066ff;
	color: #fff;
	border: none;
	padding: 6px 10px;
	border-radius: 6px;
	cursor: pointer;
`;

const ParamInput = styled.input`
	width: 120px;
	padding: 6px;
	border: 1px solid #ddd;
	border-radius: 6px;
	margin-right: 8px;
`;
