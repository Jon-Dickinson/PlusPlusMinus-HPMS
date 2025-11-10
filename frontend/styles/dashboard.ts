/**
 * Dashboard Styles
 * 
 * Re-exports dashboard components from the shared styling system
 * organized by atomic design principles
 */

// Atoms - Basic UI elements
export {
  SaveButton,
  NotesInput,
  MessageDiv
} from '../components/atoms/--shared-styles';

// Molecules - Composite layout components  
export {
  MapPanel,
  RowWrapper,
  ColWrapper,
  ResourceColumn,
  InfoColumn
} from '../components/molecules/--shared-styles';

// Organisms - Complex page-level components
export {
  MainGridArea,
  GridHeader,
  GridContainer
} from '../components/organisms/--shared-styles';