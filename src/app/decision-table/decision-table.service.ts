import { Injectable } from '@angular/core';
import { Observable, of, Subject } from 'rxjs';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { ToastrService } from 'ngx-toastr';
import { catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';

export type DecisionTableMessage = 'edit' | 'help' | 'fullscreen';

export class RulesWithAllowedValues {
  allowedValues: string;
  values: string[];
}

export class CreateSchemaDTO {
  tableName: string;
  hitPolicy: string;
  columnCount: number;
  rulesByInput: { [key: string]: RulesWithAllowedValues };
  rulesByOutput: { [key: string]: RulesWithAllowedValues };
  rulesByOptional: { [key: string]: RulesWithAllowedValues };
}

export class CreateSchemaResponseDTO {
  schemaId: string;
}

export class ValuesDTO {
  columnCount: number;
  valuesByInput: { [key: string]: RulesWithAllowedValues };
}

export class ValuesResponseDTO {
  valuesByOutput: { [key: string]: string[] };
}

const httpOptions = {
  headers: new HttpHeaders({
    'Content-Type': 'application/json'
  })
};

@Injectable({
  providedIn: 'root'
})
export class DecisionTableService {
  private subject = new Subject();

  constructor(private http: HttpClient, private toastrService: ToastrService) { }

  sendMessage(message: DecisionTableMessage) {
    this.subject.next(message);
  }

  getMessage (): Observable<any> {
    return this.subject.asObservable();
  }

  addSchema = (dto: CreateSchemaDTO): Observable<CreateSchemaResponseDTO> => {
    return this.http.post<CreateSchemaResponseDTO>(environment.baseUrl + '/schemas', dto, httpOptions)
      .pipe(catchError(this.handleError('addSchema', new CreateSchemaResponseDTO())));
  };

  addValuesFor = (schemaId: string, valuesDto: ValuesDTO): Observable<ValuesResponseDTO> => {
    return this.http.post<ValuesResponseDTO>(`${environment.baseUrl}/schemas/${schemaId}/values`, valuesDto, httpOptions)
      .pipe(catchError(this.handleError('addValuesFor', new ValuesResponseDTO())));
  };

  private handleError<T> (operation = 'operation', result?: T) {
    return (error: HttpErrorResponse): Observable<T> => {
      this.toastrService.error(error.error.message, `Failed to ${operation}`);
      return of(result as T);
    };
  }
}
