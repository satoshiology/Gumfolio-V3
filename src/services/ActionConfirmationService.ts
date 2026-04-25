type Listener = (pending: { id: string, name: string, args: any[], resolve: (v: any) => void, reject: (e: any) => void } | null) => void;

class ActionConfirmationService {
  private listener: Listener | null = null;

  subscribe(l: Listener) {
    this.listener = l;
  }

  requestConfirmation(id: string, name: string, args: any[]): Promise<any> {
    if (!this.listener) throw new Error("No UI listener registered for confirmation");
    
    return new Promise((resolve, reject) => {
      this.listener!({ id, name, args, resolve, reject });
    });
  }
}

export const actionConfirmationService = new ActionConfirmationService();
