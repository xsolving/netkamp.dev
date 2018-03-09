/*
* 13-12-2015
*
* Aggiunta campo IDNazione alla tabella Regioni
*/
alter table Regioni add IDNazione int null;

update Regioni set IDNazione=110;


/*
* 16-12-15
* Aggiunta campo lingua
*/
alter table clienti add IDLingua int null default -1


/*
* 08-02-16
* Aggiunta campo FullCustomerData
*/
alter table clienti add FullCustomerData nvarchar(nmax) default ''

update clienti set FullCustomerData = Cognome + ' ' + Nome + ',' + Indirizzo + ',' + Citta


/**
* 07-01-2016
* Aggiunta profilo per utenti-clienti
**/
insert into [gestcamp2016_tripesce].[dbo].[Profili]  ( [IDProfilo],[Profilo],[DescProfilo] ,[DataIns])
      values( 2,'CheckInOnlineCustomer','CheckInOnlineCustomer',  '20161007' )

alter table [gestcamp2016_tripesce].[dbo].[Accounts] 
  alter column Account nvarchar(50) null;

alter table [gestcamp2016_tripesce].[dbo].[Accounts] 
  alter column Password nvarchar(50) null;
  
  
