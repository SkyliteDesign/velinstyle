/**
 * Tree-shakeable entry — no side-effect component registrations.
 */
export {
  register,
  lazyDefine,
  whenDefined,
  bootFromDOM,
  COMPONENT_LOADERS,
} from './runtime/index.js';
