::[Bat To Exe Converter]
::
::YAwzoRdxOk+EWAjk
::fBw5plQjdCuDJF2F5ktwDCdwQxOMMGS7AqYg5Of84LvJq04SNA==
::YAwzuBVtJxjWCl3EqQJgSA==
::ZR4luwNxJguZRRnk
::Yhs/ulQjdF+5
::cxAkpRVqdFKZSDk=
::cBs/ulQjdF+5
::ZR41oxFsdFKZSDk=
::eBoioBt6dFKZSDk=
::cRo6pxp7LAbNWATEpCI=
::egkzugNsPRvcWATEpCI=
::dAsiuh18IRvcCxnZtBJQ
::cRYluBh/LU+EWAnk
::YxY4rhs+aU+IeA==
::cxY6rQJ7JhzQF1fEqQJhZk4aG0rbXA==
::ZQ05rAF9IBncCkqN+0xwdVsFAlXMbSXrZg==
::ZQ05rAF9IAHYFVzEqQIAATV6DDe2CU+TKdU=
::eg0/rx1wNQPfEVWB+kM9LVsJDDKnEyWfPpB8
::fBEirQZwNQPfEVWB+kM9LVsJDBSLMmXa
::cRolqwZ3JBvQF1fEqQIEJxRYX0SyNWW0RoYI/ezy4Io=
::dhA7uBVwLU+EWGmt2mxwGy9haC2tfEqTZg==
::YQ03rBFzNR3SWATExGseBltneDGmFUTa
::dhAmsQZ3MwfNWATExGseBihgeSCrEyvoVudJiA==
::ZQ0/vhVqMQ3MEVWAtB9wPFVZSUuSNWW0HrQViA==
::Zg8zqx1/OA3MEVWAtB9wSA==
::dhA7pRFwIByZRRmQuk81ZwtdQgqaPWLa
::Zh4grVQjdCuDJF2F5ktwDCdwQxOMMGS7AqYg7+fv4KqCunEucc4TRLn+9fTdYMYS+VHYQ7MClikavuo/OFVdZhfL
::YB416Ek+ZG8=
::
::
::978f952a14a936cc963da21a135fa983
@echo off
REM Hapus package-lock.json jika ada
if exist "package-lock.json" (
    del /f /q "package-lock.json"
    echo package-lock.json deleted.
) else (
    echo package-lock.json not found.
)

REM Jalankan npm install
echo Running npm install...
call npm install

REM Jalankan npm run dev
echo Starting npm run dev...
call npm run dev

pause
