
export type SecurityRuleContext = {
    path: string;
    operation: 'get' | 'list' | 'create' | 'update' | 'delete' | 'write';
    requestResourceData?: any;
};
  
const FIRESTORE_PERMISSION_ERROR_NAME = 'FirestorePermissionError';

export class FirestorePermissionError extends Error {
    constructor(public context: SecurityRuleContext) {
        const { path, operation } = context;
        const message = `FirestorePermissionError: Insufficient permissions for ${operation} at ${path}.`;
        super(message);
        this.name = FIRESTORE_PERMISSION_ERROR_NAME;
        Object.setPrototypeOf(this, FirestorePermissionError.prototype);
    }
}
