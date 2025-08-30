import React, { useState, useEffect } from 'react';
import dayjs from 'dayjs';
import { Calendar as DatePicker } from 'react-date-range';
import SubHeader, { SubHeaderLeft, SubHeaderRight } from '../../../layout/SubHeader/SubHeader';
import Icon from '../../../components/icon/Icon';
import Button from '../../../components/bootstrap/Button';
import Page from '../../../layout/Page/Page';
import PageWrapper from '../../../layout/PageWrapper/PageWrapper';
import Popovers from '../../../components/bootstrap/Popovers';
import { demoPagesMenu } from '../../../menu';
import useDarkMode from '../../../hooks/useDarkMode';
import { enUS } from 'date-fns/locale';
import Card, {
	CardActions,
	CardBody,
	CardHeader,
	CardLabel,
	CardTitle,
} from '../../../components/bootstrap/Card';
import Dropdown, {
	DropdownItem,
	DropdownMenu,
	DropdownToggle,
} from '../../../components/bootstrap/Dropdown';
import OffCanvas, {
	OffCanvasBody,
	OffCanvasHeader,
	OffCanvasTitle,
} from '../../../components/bootstrap/OffCanvas';
import FormGroup from '../../../components/bootstrap/forms/FormGroup';
import Input from '../../../components/bootstrap/forms/Input';
import Textarea from '../../../components/bootstrap/forms/Textarea';
import Checks from '../../../components/bootstrap/forms/Checks';
import PaginationButtons, {
	dataPagination,
	PER_COUNT,
} from '../../../components/PaginationButtons';
import useSortableData from '../../../hooks/useSortableData';
import classNames from 'classnames';
import { useFormik } from 'formik';
import Spinner from '../../../components/bootstrap/Spinner';

// Mock data types
interface ITodo {
	id: number;
	title: string;
	description: string;
	completed: boolean;
	priority: 'high' | 'medium' | 'low';
	dueDate: string;
	createdAt: string;
	tags: string[];
}

// Mock data generator
const generateMockTodos = (): ITodo[] => {
	const priorities: ('high' | 'medium' | 'low')[] = ['high', 'medium', 'low'];
	const sampleTasks = [
		{
			title: 'Complete project proposal',
			description: 'Finalize the quarterly project proposal for the marketing team',
		},
		{
			title: 'Review code documentation',
			description: 'Update API documentation and review code comments',
		},
		{
			title: 'Team meeting preparation',
			description: 'Prepare agenda and materials for weekly team standup',
		},
		{
			title: 'Fix authentication bug',
			description: 'Resolve the JWT token expiration issue in production',
		},
		{ title: 'Database optimization', description: 'Optimize slow queries and update indexes' },
		{
			title: 'User feedback analysis',
			description: 'Analyze customer feedback from last month and create action items',
		},
		{
			title: 'Design system update',
			description: 'Update color palette and component library',
		},
		{ title: 'Performance testing', description: 'Run load tests on the new API endpoints' },
		{
			title: 'Security audit',
			description: 'Conduct security review of user authentication flow',
		},
		{ title: 'Mobile app deployment', description: 'Deploy latest version to app stores' },
	];

	return Array.from({ length: 15 }, (_, index) => {
		const task = sampleTasks[index % sampleTasks.length];
		return {
			id: index + 1,
			title: `${task.title} ${index + 1}`,
			description: task.description,
			completed: Math.random() > 0.6,
			priority: priorities[Math.floor(Math.random() * priorities.length)],
			dueDate: dayjs()
				.add(Math.floor(Math.random() * 30), 'days')
				.format('YYYY-MM-DD'),
			createdAt: dayjs()
				.subtract(Math.floor(Math.random() * 10), 'days')
				.format('YYYY-MM-DD'),
			tags: ['work', 'urgent', 'review', 'development', 'design'].slice(
				0,
				Math.floor(Math.random() * 3) + 1,
			),
		};
	});
};

// Priority colors
const getPriorityColor = (priority: string) => {
	switch (priority) {
		case 'high':
			return 'danger';
		case 'medium':
			return 'warning';
		case 'low':
			return 'success';
		default:
			return 'info';
	}
};

const TodoExamplePage = () => {
	const { themeStatus, darkModeStatus } = useDarkMode();
	const [date, setDate] = useState<Date>(new Date());

	// State management
	const [todos, setTodos] = useState<ITodo[]>([]);
	const [loading, setLoading] = useState(true);
	const [saving, setSaving] = useState(false);
	const [currentPage, setCurrentPage] = useState(1);
	const [perPage, setPerPage] = useState(PER_COUNT['10']);

	// Offcanvas states
	const [todoDetailsOffcanvas, setTodoDetailsOffcanvas] = useState(false);
	const [todoEditOffcanvas, setTodoEditOffcanvas] = useState(false);
	const [selectedTodo, setSelectedTodo] = useState<ITodo | null>(null);

	// Load mock data with simulated timeout
	useEffect(() => {
		const loadTodos = async () => {
			setLoading(true);
			// Simulate API call delay
			await new Promise((resolve) => setTimeout(resolve, 1500));
			setTodos(generateMockTodos());
			setLoading(false);
		};

		loadTodos();
	}, []);

	const { items, requestSort, getClassNamesFor } = useSortableData(todos);

	// Form handling
	const formik = useFormik({
		initialValues: {
			title: '',
			description: '',
			priority: 'medium' as 'high' | 'medium' | 'low',
			dueDate: dayjs().format('YYYY-MM-DD'),
			completed: false,
		},
		onSubmit: async (values, { resetForm }) => {
			setSaving(true);
			// Simulate API call
			await new Promise((resolve) => setTimeout(resolve, 1000));

			const newTodo: ITodo = {
				id: Math.max(...todos.map((t) => t.id)) + 1,
				title: values.title,
				description: values.description,
				priority: values.priority,
				dueDate: values.dueDate,
				createdAt: dayjs().format('YYYY-MM-DD'),
				completed: values.completed,
				tags: ['new'],
			};

			setTodos((prev) => [newTodo, ...prev]);
			resetForm();
			setSaving(false);
			setTodoEditOffcanvas(false);
		},
	});

	// Handlers
	const handleTodoDetails = (todo: ITodo) => {
		setSelectedTodo(todo);
		setTodoDetailsOffcanvas(true);
	};

	const handleTodoEdit = (todo?: ITodo) => {
		if (todo) {
			setSelectedTodo(todo);
			formik.setValues({
				title: todo.title,
				description: todo.description,
				priority: todo.priority,
				dueDate: todo.dueDate,
				completed: todo.completed,
			});
		} else {
			setSelectedTodo(null);
			formik.resetForm();
		}
		setTodoEditOffcanvas(true);
	};

	const toggleTodoStatus = async (todoId: number) => {
		setSaving(true);
		// Simulate API call
		await new Promise((resolve) => setTimeout(resolve, 500));

		setTodos((prev) =>
			prev.map((todo) =>
				todo.id === todoId ? { ...todo, completed: !todo.completed } : todo,
			),
		);
		setSaving(false);
	};

	const deleteTodo = async (todoId: number) => {
		setSaving(true);
		// Simulate API call
		await new Promise((resolve) => setTimeout(resolve, 500));

		setTodos((prev) => prev.filter((todo) => todo.id !== todoId));
		setSaving(false);
	};

	const completedCount = todos.filter((todo) => todo.completed).length;
	const pendingCount = todos.length - completedCount;

	return (
		<PageWrapper title='Todo Example'>
			<SubHeader>
				<SubHeaderLeft>
					<Icon icon='Task' className='me-2' size='2x' />
					<span className='text-muted'>
						You have <Icon icon='TaskAlt' color='success' className='mx-1' size='lg' />{' '}
						{completedCount} completed tasks and{' '}
						<Icon icon='Schedule' color='warning' className='mx-1' size='lg' />{' '}
						{pendingCount} pending tasks.
					</span>
				</SubHeaderLeft>
				<SubHeaderRight>
					<Popovers
						desc={
							<DatePicker
								locale={enUS}
								onChange={(item) => setDate(item)}
								date={date}
								color={import.meta.env.VITE_PRIMARY_COLOR}
							/>
						}
						placement='bottom-end'
						className='mw-100'
						trigger='click'>
						<Button color={themeStatus}>
							{`${dayjs(date).startOf('weeks').format('MMM D')} - ${dayjs(date)
								.endOf('weeks')
								.format('MMM D')}`}
						</Button>
					</Popovers>
				</SubHeaderRight>
			</SubHeader>
			<Page container='fluid'>
				<Card stretch>
					<CardHeader borderSize={1}>
						<CardLabel icon='FormatListBulleted' iconColor='info'>
							<CardTitle tag='div' className='h5'>
								Todo List
							</CardTitle>
						</CardLabel>
						<CardActions>
							<Button color='success' icon='Add' onClick={() => handleTodoEdit()}>
								Add Task
							</Button>
							<Button
								color='info'
								icon='Refresh'
								isLight
								isDisable={loading}
								onClick={() => window.location.reload()}>
								{loading && <Spinner isSmall inButton />}
								Refresh
							</Button>
						</CardActions>
					</CardHeader>
					<CardBody className='table-responsive' isScrollable>
						{loading ? (
							<div
								className='d-flex justify-content-center align-items-center'
								style={{ minHeight: '400px' }}>
								<div className='text-center'>
									<Spinner size='3rem' className='mb-3' />
									<div className='h5'>Loading todos...</div>
									<div className='text-muted'>
										Please wait while we fetch your tasks
									</div>
								</div>
							</div>
						) : (
							<table className='table table-modern'>
								<thead>
									<tr>
										<td aria-labelledby='Actions' style={{ width: 60 }} />
										<th
											onClick={() => requestSort('title')}
											className='cursor-pointer text-decoration-underline'>
											Task{' '}
											<Icon
												size='lg'
												className={getClassNamesFor('title')}
												icon='FilterList'
											/>
										</th>
										<th
											onClick={() => requestSort('priority')}
											className='cursor-pointer text-decoration-underline'>
											Priority{' '}
											<Icon
												size='lg'
												className={getClassNamesFor('priority')}
												icon='FilterList'
											/>
										</th>
										<th
											onClick={() => requestSort('dueDate')}
											className='cursor-pointer text-decoration-underline'>
											Due Date{' '}
											<Icon
												size='lg'
												className={getClassNamesFor('dueDate')}
												icon='FilterList'
											/>
										</th>
										<th>Tags</th>
										<th
											onClick={() => requestSort('completed')}
											className='cursor-pointer text-decoration-underline'>
											Status{' '}
											<Icon
												size='lg'
												className={getClassNamesFor('completed')}
												icon='FilterList'
											/>
										</th>
										<td aria-labelledby='Actions' />
									</tr>
								</thead>
								<tbody>
									{dataPagination(items, currentPage, perPage).map((todo) => (
										<tr
											key={todo.id}
											className={classNames({
												'opacity-50': todo.completed,
											})}>
											<td>
												<Button
													isOutline={!darkModeStatus}
													color='dark'
													isLight={darkModeStatus}
													className={classNames({
														'border-light': !darkModeStatus,
													})}
													icon='Info'
													onClick={() => handleTodoDetails(todo)}
													aria-label='View details'
												/>
											</td>
											<td>
												<div>
													<div
														className={classNames('fw-bold', {
															'text-decoration-line-through':
																todo.completed,
														})}>
														{todo.title}
													</div>
													<div
														className='small text-muted text-truncate'
														style={{ maxWidth: '300px' }}>
														{todo.description}
													</div>
												</div>
											</td>
											<td>
												<span
													className={`badge bg-${getPriorityColor(todo.priority)}`}>
													{todo.priority.toUpperCase()}
												</span>
											</td>
											<td>
												<span
													className={classNames('text-nowrap', {
														'text-danger': dayjs(todo.dueDate).isBefore(
															dayjs(),
															'day',
														),
														'text-warning': dayjs(todo.dueDate).isSame(
															dayjs(),
															'day',
														),
													})}>
													{dayjs(todo.dueDate).format('MMM D, YYYY')}
												</span>
											</td>
											<td>
												<div className='d-flex flex-wrap gap-1'>
													{todo.tags.map((tag, index) => (
														<span
															key={index}
															className='badge bg-light text-dark'>
															{tag}
														</span>
													))}
												</div>
											</td>
											<td>
												<Button
													isLink
													color={todo.completed ? 'success' : 'warning'}
													icon={
														todo.completed ? 'CheckCircle' : 'Schedule'
													}
													onClick={() => toggleTodoStatus(todo.id)}
													isDisable={saving}>
													{todo.completed ? 'Completed' : 'Pending'}
												</Button>
											</td>
											<td>
												<Dropdown>
													<DropdownToggle hasIcon={false}>
														<Button
															isOutline={!darkModeStatus}
															color='dark'
															isLight={darkModeStatus}
															className={classNames({
																'border-light': !darkModeStatus,
															})}
															icon='MoreVert'
														/>
													</DropdownToggle>
													<DropdownMenu>
														<DropdownItem
															onClick={() => handleTodoEdit(todo)}>
															<Icon icon='Edit' className='me-2' />
															Edit
														</DropdownItem>
														<DropdownItem
															onClick={() =>
																toggleTodoStatus(todo.id)
															}
															isDisable={saving}>
															<Icon
																icon={
																	todo.completed
																		? 'Undo'
																		: 'Check'
																}
																className='me-2'
															/>
															{todo.completed
																? 'Mark Pending'
																: 'Mark Complete'}
														</DropdownItem>
														<DropdownItem isDivider />
														<DropdownItem
															onClick={() => deleteTodo(todo.id)}
															isDisable={saving}>
															<Icon icon='Delete' className='me-2' />
															Delete
														</DropdownItem>
													</DropdownMenu>
												</Dropdown>
											</td>
										</tr>
									))}
								</tbody>
							</table>
						)}
					</CardBody>
					{!loading && (
						<PaginationButtons
							data={items}
							label='todos'
							setCurrentPage={setCurrentPage}
							currentPage={currentPage}
							perPage={perPage}
							setPerPage={setPerPage}
						/>
					)}
				</Card>

				{/* Todo Details OffCanvas */}
				<OffCanvas
					setOpen={setTodoDetailsOffcanvas}
					isOpen={todoDetailsOffcanvas}
					titleId='todoDetails'
					placement='bottom'>
					<OffCanvasHeader setOpen={setTodoDetailsOffcanvas}>
						<OffCanvasTitle id='todoDetails'>
							Task Details: {selectedTodo?.title}
						</OffCanvasTitle>
					</OffCanvasHeader>
					<OffCanvasBody>
						{selectedTodo && (
							<div className='row g-4'>
								<div className='col-lg-6'>
									<FormGroup
										id='titleInfo'
										label='Title'
										isColForLabel
										labelClassName='col-sm-3 text-capitalize'
										childWrapperClassName='col-sm-9'>
										<Input value={selectedTodo.title} readOnly disabled />
									</FormGroup>
								</div>
								<div className='col-lg-6'>
									<FormGroup
										id='priorityInfo'
										label='Priority'
										isColForLabel
										labelClassName='col-sm-3 text-capitalize'
										childWrapperClassName='col-sm-9'>
										<Input
											value={selectedTodo.priority.toUpperCase()}
											readOnly
											disabled
										/>
									</FormGroup>
								</div>
								<div className='col-lg-6'>
									<FormGroup
										id='dueDateInfo'
										label='Due Date'
										isColForLabel
										labelClassName='col-sm-3 text-capitalize'
										childWrapperClassName='col-sm-9'>
										<Input
											value={dayjs(selectedTodo.dueDate).format(
												'MMM D, YYYY',
											)}
											readOnly
											disabled
										/>
									</FormGroup>
								</div>
								<div className='col-lg-6'>
									<FormGroup
										id='statusInfo'
										label='Status'
										isColForLabel
										labelClassName='col-sm-3 text-capitalize'
										childWrapperClassName='col-sm-9'>
										<Input
											value={selectedTodo.completed ? 'Completed' : 'Pending'}
											readOnly
											disabled
										/>
									</FormGroup>
								</div>
								<div className='col-12'>
									<FormGroup
										id='descriptionInfo'
										label='Description'
										isColForLabel
										labelClassName='col-sm-2 text-capitalize'
										childWrapperClassName='col-sm-10'>
										<Textarea
											value={selectedTodo.description}
											readOnly
											disabled
											rows={4}
										/>
									</FormGroup>
								</div>
							</div>
						)}
					</OffCanvasBody>
				</OffCanvas>

				{/* Todo Edit OffCanvas */}
				<OffCanvas
					setOpen={setTodoEditOffcanvas}
					isOpen={todoEditOffcanvas}
					titleId='todoEdit'
					isBodyScroll
					placement='end'>
					<OffCanvasHeader setOpen={setTodoEditOffcanvas}>
						<OffCanvasTitle id='todoEdit'>
							{selectedTodo ? 'Edit Task' : 'Add New Task'}
						</OffCanvasTitle>
					</OffCanvasHeader>
					<OffCanvasBody>
						<form onSubmit={formik.handleSubmit}>
							<div className='row g-4'>
								<div className='col-12'>
									<FormGroup id='title' label='Title' isRequired>
										<Input
											onChange={formik.handleChange}
											value={formik.values.title}
											placeholder='Enter task title...'
										/>
									</FormGroup>
								</div>
								<div className='col-12'>
									<FormGroup id='description' label='Description'>
										<Textarea
											onChange={formik.handleChange}
											value={formik.values.description}
											placeholder='Enter task description...'
											rows={4}
										/>
									</FormGroup>
								</div>
								<div className='col-6'>
									<FormGroup id='priority' label='Priority'>
										<select
											className='form-select'
											name='priority'
											onChange={formik.handleChange}
											value={formik.values.priority}>
											<option value='low'>Low</option>
											<option value='medium'>Medium</option>
											<option value='high'>High</option>
										</select>
									</FormGroup>
								</div>
								<div className='col-6'>
									<FormGroup id='dueDate' label='Due Date'>
										<Input
											type='date'
											onChange={formik.handleChange}
											value={formik.values.dueDate}
										/>
									</FormGroup>
								</div>
								<div className='col-12'>
									<FormGroup>
										<Checks
											id='completed'
											type='switch'
											label='Mark as completed'
											onChange={formik.handleChange}
											checked={formik.values.completed}
										/>
									</FormGroup>
								</div>
							</div>
						</form>
					</OffCanvasBody>
					<div className='row m-0'>
						<div className='col-12 p-3'>
							<Button
								color='info'
								className='w-100'
								onClick={formik.submitForm}
								isDisable={saving || !formik.values.title.trim()}>
								{saving && <Spinner isSmall inButton />}
								{selectedTodo ? 'Update Task' : 'Add Task'}
							</Button>
						</div>
					</div>
				</OffCanvas>
			</Page>
		</PageWrapper>
	);
};

export default TodoExamplePage;
